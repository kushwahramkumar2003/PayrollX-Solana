import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  AuthResponseDto,
  LogoutResponseDto,
  UserDto,
} from '@payrollx/contracts';
import { LocalAuthGuard } from './guards/local-auth.guard';

/**
 * Authentication Controller
 *
 * Handles all authentication-related endpoints:
 * - User login
 * - User registration
 * - Token refresh
 * - User logout
 *
 * All endpoints are under the /api/auth prefix.
 *
 * @class AuthController
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User Login Endpoint
   *
   * Authenticates a user with email and password.
   * Uses LocalStrategy via LocalAuthGuard for validation.
   *
   * Flow:
   * 1. LocalAuthGuard calls LocalStrategy.validate()
   * 2. LocalStrategy calls AuthService.validateUser()
   * 3. If valid, req.user is set with user entity
   * 4. Controller receives req.user and calls AuthService.login()
   * 5. Returns access token, refresh token, and user data
   *
   * @param req - Express request object with user from LocalStrategy
   * @param loginDto - Login credentials (email, password, optional organizationId)
   * @returns Authentication response with tokens and user data
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates a user with email and password. Returns JWT access token and refresh token.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async login(
    @Request() req: { user: unknown },
    @Body() loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    // req.user is set by LocalStrategy after successful validation
    // It contains the user entity (without password) from validateUser()
    // Type assertion: req.user is the UserEntity returned from validateUser()
    return this.authService.login(req.user as {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      organizationId: string | null;
      createdAt: Date;
      updatedAt: Date;
    });
  }

  /**
   * User Registration Endpoint
   *
   * Creates a new user account.
   * Validates email uniqueness and hashes password.
   *
   * @param registerDto - Registration data (email, password, firstName, lastName, optional organizationId)
   * @returns Created user data (without password)
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User registration',
    description: 'Creates a new user account. Email must be unique.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or registration error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Registration failed' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - email already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: {
          type: 'string',
          example: 'User with this email already exists',
        },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  async register(@Body() registerDto: RegisterDto): Promise<UserDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Token Refresh Endpoint
   *
   * Generates a new access token using a valid refresh token.
   * The refresh token must exist in the database and not be expired.
   *
   * @param refreshTokenDto - Refresh token data
   * @returns New access token, same refresh token, and user data
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generates a new access token using a valid refresh token. Refresh token must not be expired.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: {
          type: 'string',
          example: 'Invalid or expired refresh token',
        },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * User Logout Endpoint
   *
   * Invalidates a refresh token by removing it from the database.
   * This prevents further token refreshes with that token.
   *
   * Note: Access tokens are stateless JWTs and cannot be invalidated
   * until they expire. Consider implementing token blacklisting
   * for enhanced security if needed.
   *
   * @param refreshTokenDto - Refresh token to invalidate
   * @returns Success message
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User logout',
    description:
      'Invalidates a refresh token by removing it from the database. Access tokens remain valid until expiration.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token to invalidate',
  })
  @ApiResponse({
  status: 200,
    description: 'Logout successful',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<LogoutResponseDto> {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }
}
