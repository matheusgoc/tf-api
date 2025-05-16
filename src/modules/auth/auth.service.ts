import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { EncryptionService } from '../core/encryption/encryption.service';
import { User } from '../../entities/user.entity';
import { EnrollDto } from '@/modules/auth/dto/enroll.dto';

export enum AUTH_PURPOSE {
  SIGN_IN = 'sign_in',
  SIGN_IN_MFA = 'sign_in_mfa',
  ENROLL = 'enroll',
  RESET_PSW = 'reset_psw',
  CHECK_EMAIL = 'check_email',
  CHECK_PHONE = 'check_phone',
}

export enum UNAUTHORIZED_REASON {
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  REVOKED_TOKEN = 'REVOKED_TOKEN',
  INVALID_TOKEN_PURPOSE = 'INVALID_TOKEN_PURPOSE',
  USER_NOT_ACTIVE = 'USER_NOT_ACTIVE',
  USER_IS_ENROLLED = 'USER_IS_ENROLLED',
}

@Injectable()
export class AuthService extends EncryptionService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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

  async enroll(dto: EnrollDto) {
    const decodedToken = this.verifyToken(dto.token, AUTH_PURPOSE.ENROLL);

    const { sub: id } = decodedToken;

    const enrolledUser = await this.userService.enroll(id, dto.password);

    return this.generateToken(enrolledUser, AUTH_PURPOSE.SIGN_IN);
  }

  verifyToken(token: string, purpose: AUTH_PURPOSE) {
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

    const { purpose: tokenPurpose } = decodedToken;

    if (tokenPurpose !== purpose) {
      throw new UnauthorizedException(
        UNAUTHORIZED_REASON.INVALID_TOKEN_PURPOSE,
      );
    }

    return decodedToken;
  }
}
