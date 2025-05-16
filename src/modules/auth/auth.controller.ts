import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { UserService } from '../../modules/user/user.service';
import { UserProfileDto } from '../../modules/user/dto/user-profile.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from '../../entities/user.entity';
import { AUTH_PURPOSE, AuthService, UNAUTHORIZED_REASON } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { EnrollDto } from '@/modules/auth/dto/enroll.dto';
import { TokenVerifyDTO } from '@/modules/auth/dto/token-verify.dto';

@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: Request & { user: User }) {
    return this.authService.generateToken(req.user, AUTH_PURPOSE.SIGN_IN);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Patch('profile')
  updateProfile(
    @Req() req: { user: User },
    @Body() userProfileDto: UserProfileDto,
  ) {
    const id = req.user.id.toString();

    return this.userService.updateProfile(id, userProfileDto);
  }

  @SkipAuth()
  @Patch('enroll')
  async enroll(@Body() dto: EnrollDto) {
    return this.authService.enroll(dto);
  }

  @SkipAuth()
  @Patch('token/verify')
  async verify(@Body() dto: TokenVerifyDTO) {
    const decodedToken = this.authService.verifyToken(dto.token, dto.purpose);
    const { sub: id } = decodedToken;
    const user = await this.userService.findOne(id);
    if (dto.purpose === AUTH_PURPOSE.ENROLL && user.enrolledAt) {
      throw new UnauthorizedException(UNAUTHORIZED_REASON.USER_IS_ENROLLED);
    }

    return user;
  }
}
