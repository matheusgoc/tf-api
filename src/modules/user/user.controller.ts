import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NO_CONTENT } from 'http-status';

import { User } from '../../entities/user.entity';
import { UserService } from './user.service';
import { UserProfileDto } from '../../modules/user/dto/user-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUserDto } from './dto/list-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  findAll(@Query() options: ListUserDto) {
    return this.userService.findAll(options);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch('/profile')
  updateProfile(
    @Req() req: { user: User },
    @Body() userProfileDto: UserProfileDto,
  ) {
    const id = req.user.id.toString();

    return this.userService.updateProfile(id, userProfileDto);
  }

  @HttpCode(NO_CONTENT)
  @Delete(':id')
  deactivate(@Param('id') id: string) {
    this.userService.deactivate(id);
  }

  @HttpCode(NO_CONTENT)
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    this.userService.activate(id);
  }
}
