import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CollectionService } from '@/modules/collection/collection.service';
import { CollectionDto } from '@/modules/collection/dto/collection.dto';
import { ListCollectionDto } from '@/modules/collection/dto/list-collection.dto';
import { ShowCollectionDto } from '@/modules/collection/dto/show-collection.dto';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { USER_ROLE } from '@/entities/user.entity';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';

@Controller('collection')
export class CollectionController {
  constructor(private readonly service: CollectionService) {}

  @Get(':id')
  findOne(@Param('id') id: string, @Query() options: ShowCollectionDto) {
    return this.service.findOne(id, options);
  }

  @Get()
  findAll(@Query() options: ListCollectionDto) {
    return this.service.findAll(options);
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CollectionDto) {
    return this.service.create(dto);
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CollectionDto) {
    return this.service.update(id, dto);
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.service.unpublish(id);
  }
}
