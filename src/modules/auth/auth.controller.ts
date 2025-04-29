import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';

import { UserService } from '../../modules/user/user.service';
import { UserProfileDto } from '../../modules/user/dto/user-profile.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from '../../entities/user.entity';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SkipAuth } from './decorators/skip-auth.decorator';

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
    return this.authService.generateToken(req.user);
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
}
