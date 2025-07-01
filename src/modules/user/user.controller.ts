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
} from '@nestjs/common';
import { NO_CONTENT } from 'http-status';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUserDto } from './dto/list-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { USER_ROLE } from '@/entities/user.entity';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';

@Roles(USER_ROLE.ADMIN)
@UseGuards(RolesGuard)
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

  @HttpCode(NO_CONTENT)
  @Delete(':id')
  async deactivate(@Param('id') id: string) {
    await this.userService.deactivate(id);
  }

  @HttpCode(NO_CONTENT)
  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    await this.userService.activate(id);
  }

  @HttpCode(NO_CONTENT)
  @Patch(':id/enroll')
  async enroll(@Param('id') id: string) {
    await this.userService.startEnrollment(id);
  }
}
