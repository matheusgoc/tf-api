import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NO_CONTENT } from 'http-status';

import { CollectionItemService } from '@/modules/collection/collection-item.service';
import { CollectionItemDto } from '@/modules/collection/dto/collection-item.dto';
import { CollectionItemOrderDto } from '@/modules/collection/dto/collection-item-order.dto';
import { ListCollectionItemDto } from '@/modules/collection/dto/list-collection-item.dto';
import { USER_ROLE } from '@/entities/user.entity';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@Controller('collection/:collectionId/item')
export class CollectionItemController {
  constructor(private readonly service: CollectionItemService) {}

  @Get(':itemId')
  findOne(
    @Param('collectionId') collectionId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.service.findOne(collectionId, itemId);
  }

  @Get()
  findAll(
    @Param('collectionId') collectionId: string,
    @Query() options: ListCollectionItemDto,
  ) {
    return this.service.findAll(collectionId, options);
  }

  @Roles(USER_ROLE.SELLER)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('collectionId') collectionId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 3 * 1024 * 1024 }), // 3MB max size
          new FileTypeValidator({
            fileType: /(image\/jpeg|image\/png|image\/webp)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.service.upload(collectionId, file.buffer);
  }

  @Roles(USER_ROLE.SELLER)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Put(':itemId')
  update(
    @Param('collectionId') collectionId: string,
    @Param('itemId') itemId: string,
    @Body() dto: CollectionItemDto,
  ) {
    return this.service.update(collectionId, itemId, dto);
  }

  @Roles(USER_ROLE.SELLER)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':itemId')
  @HttpCode(NO_CONTENT)
  async delete(
    @Param('collectionId') collectionId: string,
    @Param('itemId') itemId: string,
  ) {
    await this.service.delete(collectionId, itemId);
  }

  @Roles(USER_ROLE.SELLER)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':itemId/restore')
  @HttpCode(NO_CONTENT)
  async restore(
    @Param('collectionId') collectionId: string,
    @Param('itemId') itemId: string,
  ) {
    await this.service.restore(collectionId, itemId);
  }

  @Roles(USER_ROLE.SELLER)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('/sort')
  @HttpCode(NO_CONTENT)
  async sort(
    @Param('collectionId') collectionId: string,
    @Body() dto: CollectionItemOrderDto,
  ) {
    await this.service.sort(collectionId, dto.items);
  }
}
