import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto, UserDto, UserRole } from "@payrollx/contracts";
import * as bcrypt from "bcrypt";

/**
 * User entity interface
 *
 * Represents the user object returned from Prisma after password removal.
 * This is what gets passed to login() method from LocalStrategy.
 */
interface UserEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * JWT Payload interface
 *
 * Structure of the JWT token payload.
 */
interface JwtPayload {
  email: string;
  sub: string; // User ID
  role: string;
  organizationId?: string | null;
}

/**
 * Auth Service
 *
 * Handles user authentication, registration, and token management.
 *
 * Responsibilities:
 * - User validation and authentication
 * - JWT access and refresh token generation
 * - User registration
 * - Token refresh and logout
 * - Password hashing and validation
 *
 * @class AuthService
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Validates user credentials against the database.
   *
   * This method is called by LocalStrategy during login.
   * It checks if the email exists and if the password matches.
   *
   * @param email - User email address
   * @param password - Plain text password
   * @param organizationId - Optional organization ID for multi-tenant support
   * @returns User entity without password, or null if credentials are invalid
   */
  async validateUser(
    email: string,
    password: string,
    organizationId?: string
  ): Promise<UserEntity | null> {
    this.logger.debug(`Validating user credentials for email: ${email}`);

    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        this.logger.warn(`Login attempt with non-existent email: ${email}`);
        return null;
      }

      // Check if user belongs to the specified organization (if provided)
      if (organizationId && user.organizationId !== organizationId) {
        this.logger.warn(
          `User ${email} does not belong to organization ${organizationId}`
        );
        return null;
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        this.logger.warn(`Invalid password attempt for email: ${email}`);
        return null;
      }

      // Remove password from user object before returning
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      this.logger.debug(`User ${email} validated successfully`);

      return userWithoutPassword as UserEntity;
    } catch (error) {
      this.logger.error(`Error validating user ${email}:`, error);
      return null;
    }
  }

  /**
   * Logs in a user and generates JWT tokens.
   *
   * This method is called after successful validation via LocalStrategy.
   * It generates both access and refresh tokens and stores the refresh token.
   *
   * @param user - User entity (from validateUser, already validated)
   * @returns Authentication response with tokens and user data
   */
  async login(user: UserEntity): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserDto;
  }> {
    const correlationId = this.generateCorrelationId();
    this.logger.log(`User login initiated: ${user.email}`, {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      correlationId,
    });

    try {
      // Build JWT payload
      const payload: JwtPayload = {
        email: user.email,
        sub: user.id,
        role: user.role,
        organizationId: user.organizationId,
      };

      // Generate access token (short-lived, default 1h)
      const accessToken = this.jwtService.sign(payload);

      // Generate refresh token (long-lived, default 7d)
      const refreshTokenSecret =
        this.configService.get<string>("JWT_REFRESH_SECRET") ||
        this.configService.get<string>("JWT_SECRET") ||
        "refresh-secret-key";
      const refreshTokenExpiresIn =
        this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") || "7d";

      const refreshToken = this.jwtService.sign(payload, {
        secret: refreshTokenSecret,
        expiresIn: refreshTokenExpiresIn,
      });

      // Calculate expiration date for refresh token
      const expiresInDays = parseInt(refreshTokenExpiresIn, 10) || 7;
      const expiresAt = new Date(
        Date.now() + expiresInDays * 24 * 60 * 60 * 1000
      );

      // Store refresh token in database
      await this.prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      // Build user DTO for response
      const userDto: UserDto = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as UserRole,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      this.logger.log(`User ${user.email} logged in successfully`, {
        userId: user.id,
        correlationId,
      });

      return {
        accessToken,
        refreshToken,
        user: userDto,
      };
    } catch (error) {
      this.logger.error(`Error during login for user ${user.email}:`, error);
      throw new UnauthorizedException("Login failed. Please try again.");
    }
  }

  /**
   * Registers a new user account.
   *
   * Validates that the email is unique, hashes the password,
   * and creates the user in the database.
   *
   * @param registerDto - Registration data (email, password, firstName, lastName, optional organizationId)
   * @returns Created user entity without password
   * @throws ConflictException if email already exists
   */
  async register(registerDto: RegisterDto): Promise<UserDto> {
    const correlationId = this.generateCorrelationId();
    this.logger.log(`User registration initiated: ${registerDto.email}`, {
      email: registerDto.email,
      organizationId: registerDto.organizationId,
      correlationId,
    });

    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        this.logger.warn(
          `Registration attempt with existing email: ${registerDto.email}`,
          { correlationId }
        );
        throw new ConflictException("User with this email already exists");
      }

      // Hash password with bcrypt (12 rounds for security)
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(
        registerDto.password,
        saltRounds
      );

      // Create user in database
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          role: "EMPLOYEE", // Default role for new users
          organizationId: registerDto.organizationId || null,
        },
      });

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      this.logger.log(`User ${registerDto.email} registered successfully`, {
        userId: user.id,
        correlationId,
      });

      // Return user DTO
      return {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        firstName: userWithoutPassword.firstName,
        lastName: userWithoutPassword.lastName,
        role: userWithoutPassword.role as UserRole,
        organizationId: userWithoutPassword.organizationId,
        createdAt: userWithoutPassword.createdAt,
        updatedAt: userWithoutPassword.updatedAt,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      this.logger.error(
        `Error during registration for ${registerDto.email}:`,
        error
      );
      throw new BadRequestException("Registration failed. Please try again.");
    }
  }

  /**
   * Refreshes an access token using a refresh token.
   *
   * Validates the refresh token, verifies it's not expired,
   * and generates a new access token.
   *
   * @param refreshTokenString - Refresh token string
   * @returns New access token, same refresh token, and user data
   * @throws UnauthorizedException if refresh token is invalid or expired
   */
  async refreshToken(refreshTokenString: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserDto;
  }> {
    const correlationId = this.generateCorrelationId();
    this.logger.debug("Token refresh initiated", { correlationId });

    try {
      // Find refresh token in database
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshTokenString },
        include: { user: true },
      });

      // Validate token exists and is not expired
      if (!tokenRecord) {
        this.logger.warn("Token refresh attempt with non-existent token", {
          correlationId,
        });
        throw new UnauthorizedException("Invalid refresh token");
      }

      if (tokenRecord.expiresAt < new Date()) {
        this.logger.warn("Token refresh attempt with expired token", {
          tokenId: tokenRecord.id,
          correlationId,
        });
        // Clean up expired token
        await this.prisma.refreshToken.delete({
          where: { id: tokenRecord.id },
        });
        throw new UnauthorizedException("Refresh token has expired");
      }

      const user = tokenRecord.user;

      // Build JWT payload
      const payload: JwtPayload = {
        email: user.email,
        sub: user.id,
        role: user.role,
        organizationId: user.organizationId,
      };

      // Generate new access token
      const newAccessToken = this.jwtService.sign(payload);

      this.logger.log(`Token refreshed successfully for user ${user.email}`, {
        userId: user.id,
        correlationId,
      });

      // Return new access token, same refresh token, and user data
      return {
        accessToken: newAccessToken,
        refreshToken: refreshTokenString,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as UserRole,
          organizationId: user.organizationId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error("Error during token refresh:", error);
      throw new UnauthorizedException("Token refresh failed");
    }
  }

  /**
   * Logs out a user by invalidating their refresh token.
   *
   * Removes the refresh token from the database, effectively
   * preventing further token refreshes with that token.
   *
   * @param refreshTokenString - Refresh token to invalidate
   * @returns Success message
   */
  async logout(refreshTokenString: string): Promise<{ message: string }> {
    const correlationId = this.generateCorrelationId();
    this.logger.debug("Logout initiated", { correlationId });

    try {
      // Find and delete the refresh token
      const deletedTokens = await this.prisma.refreshToken.deleteMany({
        where: { token: refreshTokenString },
      });

      if (deletedTokens.count === 0) {
        this.logger.warn(
          "Logout attempt with non-existent or already deleted token",
          { correlationId }
        );
        // Return success anyway to not reveal token existence
        return { message: "Logged out successfully" };
      }

      this.logger.log("User logged out successfully", {
        tokensDeleted: deletedTokens.count,
        correlationId,
      });

      return { message: "Logged out successfully" };
    } catch (error) {
      this.logger.error("Error during logout:", error);
      // Return success anyway to not reveal internal errors
      return { message: "Logged out successfully" };
    }
  }

  /**
   * Generates a unique correlation ID for request tracing.
   *
   * Format: timestamp-randomString
   *
   * @returns Correlation ID string
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
