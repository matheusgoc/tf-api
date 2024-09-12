import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { EncryptionService } from '../core/encryption/encryption.service';
import { User } from '../../entities/user.entity';

@Injectable()
export class AuthService extends EncryptionService {
  constructor(
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

  generateToken(user: User) {
    delete user.password;

    const payload = {
      sub: user.id,
    };

    // generate token
    const token = this.jwtService.sign({ sub: user.id });

    // get the issue and expiration timestamps for calculating duration
    const { iat, exp } = this.jwtService.decode<{ exp: number; iat: number }>(
      token,
    );

    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      expires_in: exp - iat,
      user,
    };
  }
}
