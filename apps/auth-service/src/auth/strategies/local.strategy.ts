import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * Local Strategy
 *
 * Implements Passport's local strategy for username/password authentication.
 * Uses email as the username field.
 *
 * This strategy:
 * 1. Receives email and password from request body
 * 2. Calls AuthService.validateUser() to verify credentials
 * 3. Returns user entity if valid, throws UnauthorizedException if invalid
 * 4. The returned user is attached to req.user for use in controllers
 *
 * @class LocalStrategy
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    // Configure strategy to use 'email' field instead of default 'username'
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  /**
   * Validates user credentials.
   *
   * Called automatically by Passport when LocalAuthGuard is used.
   * Extracts email and password from request body and validates them.
   *
   * @param email - User email address
   * @param password - Plain text password
   * @returns User entity (without password) if credentials are valid
   * @throws UnauthorizedException if credentials are invalid
   */
  async validate(email: string, password: string): Promise<unknown> {
    this.logger.debug(`Validating credentials for email: ${email}`);

    // Call auth service to validate user
    // Pass undefined for organizationId to allow login without org context
    // The organizationId can be extracted from request if needed for multi-tenant
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      this.logger.warn(`Authentication failed for email: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.debug(`Authentication successful for email: ${email}`);

    // Return user entity (password already removed in validateUser)
    // This will be attached to req.user in the controller
    return user;
  }
}
