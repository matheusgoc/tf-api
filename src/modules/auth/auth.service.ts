import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { EncryptionService } from '../core/encryption/encryption.service';
import { User } from '../../entities/user.entity';
import { UserMailService } from '@/modules/mail/user-mail.service';

export enum AUTH_PURPOSE {
  SIGN_IN = 'sign_in',
  SIGN_IN_MFA = 'sign_in_mfa',
  ENROLL = 'enroll',
  RESET_PSW = 'reset_psw',
  CHECK_EMAIL = 'check_email',
  CHECK_PHONE = 'check_phone',
}

export enum UNAUTHORIZED_REASON {
  CREDENTIALS_NOT_MATCH = 'CREDENTIALS_NOT_MATCH',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  REVOKED_TOKEN = 'REVOKED_TOKEN',
  INVALID_TOKEN_PURPOSE = 'INVALID_TOKEN_PURPOSE',
  USER_NOT_ACTIVE = 'USER_NOT_ACTIVE',
  USER_IS_ENROLLED = 'USER_IS_ENROLLED',
  USER_NOT_ENROLLED = 'USER_NOT_ENROLLED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
}

@Injectable()
export class AuthService extends EncryptionService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly userMailService: UserMailService,
  ) {
    super();
  }

  async authenticate(username: string, password: string) {
    const user = await this.userService.findByEmail(username);

    if (!user || !user.password || user.deactivatedAt) {
      return null;
    }

    const { password: hash, ...userWithoutPw } = user;
    const isPasswordValid = await this.comparePassword(password, hash);

    return isPasswordValid ? userWithoutPw : null;
  }

  generateToken(user: User, purpose: AUTH_PURPOSE) {
    delete user.password;

    // generate token
    const token = this.jwtService.sign({
      sub: user.id,
      purpose,
    });

    // get the issue and expiration timestamps for calculating duration
    const { iat, exp } = this.jwtService.decode<{ exp: number; iat: number }>(
      token,
    );

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: exp - iat,
      purpose,
      user,
    };
  }

  async verifyToken(token: string, purpose: AUTH_PURPOSE) {
    let decodedToken: { sub: string; purpose: AUTH_PURPOSE };

    try {
      decodedToken = this.jwtService.verify<typeof decodedToken>(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(UNAUTHORIZED_REASON.EXPIRED_TOKEN);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(UNAUTHORIZED_REASON.INVALID_TOKEN);
      }

      throw new UnauthorizedException(error);
    }

    const { sub: id, purpose: tokenPurpose } = decodedToken;

    if (tokenPurpose !== purpose) {
      throw new UnauthorizedException(
        UNAUTHORIZED_REASON.INVALID_TOKEN_PURPOSE,
      );
    }

    const user = await this.userService.findOne(id);

    // user must be active in any case except for resetting password
    if (purpose !== AUTH_PURPOSE.RESET_PSW) {
      if (user.deactivatedAt) {
        throw new UnauthorizedException(UNAUTHORIZED_REASON.USER_NOT_ACTIVE);
      }
    }

    // user must not be enrolled to perform enroll action
    if (purpose === AUTH_PURPOSE.ENROLL) {
      if (user.enrolledAt) {
        throw new UnauthorizedException(UNAUTHORIZED_REASON.USER_IS_ENROLLED);
      }
    }

    // user must be enrolled in any other case
    else if (!user.enrolledAt) {
      throw new UnauthorizedException(UNAUTHORIZED_REASON.USER_NOT_ENROLLED);
    }

    return user;
  }

  async enroll(token: string, password: string) {
    const user = await this.verifyToken(token, AUTH_PURPOSE.ENROLL);

    const enrolledUser = await this.userService.enroll(user, password);

    return this.generateToken(enrolledUser, AUTH_PURPOSE.SIGN_IN);
  }

  async rememberPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.enrolledAt) {
      throw new NotFoundException(UNAUTHORIZED_REASON.USER_NOT_FOUND);
    }

    const token = this.generateToken(user, AUTH_PURPOSE.RESET_PSW);

    this.userMailService.sendResetPasswordEmail(user, token.access_token);
  }

  async resetPassword(token: string, password: string) {
    const user = await this.verifyToken(token, AUTH_PURPOSE.RESET_PSW);

    const savedUser = await this.userService.setPassword(user, password);

    return this.generateToken(savedUser, AUTH_PURPOSE.SIGN_IN);
  }
}
