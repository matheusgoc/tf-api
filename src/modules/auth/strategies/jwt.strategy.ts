import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserService } from '../../user/user.service';
import { AUTH_PURPOSE, UNAUTHORIZED_REASON } from '@/modules/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly config: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; purpose: AUTH_PURPOSE }) {
    const user = await this.userService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException(UNAUTHORIZED_REASON.INVALID_TOKEN);
    }

    if (user.deactivatedAt) {
      throw new UnauthorizedException(UNAUTHORIZED_REASON.USER_NOT_ACTIVE);
    }

    if (payload.purpose !== AUTH_PURPOSE.SIGN_IN) {
      throw new UnauthorizedException(
        UNAUTHORIZED_REASON.INVALID_TOKEN_PURPOSE,
      );
    }

    delete user.password;

    return { ...user };
  }
}
