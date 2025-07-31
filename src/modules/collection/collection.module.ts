import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { CollectionItemController } from './collection-item.controller';
import { CollectionItemService } from './collection-item.service';
import { Collection } from '@/entities/collection.entity';
import { CollectionItem } from '@/entities/collection-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, CollectionItem])],
  controllers: [CollectionController, CollectionItemController],
  providers: [CollectionService, CollectionItemService],
})
export class CollectionModule {}
