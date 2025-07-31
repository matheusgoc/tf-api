import { Injectable, NotFoundException } from '@nestjs/common';
import { Collection, MongoRepository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoFindManyOptions } from 'typeorm/find-options/mongodb/MongoFindManyOptions';

import { CollectionItemDto } from '@/modules/collection/dto/collection-item.dto';
import { CollectionItem } from '@/entities/collection-item.entity';
import { CollectionItemPosition } from '@/modules/collection/dto/collection-item-order.dto';
import { ListCollectionItemDto } from '@/modules/collection/dto/list-collection-item.dto';

@Injectable()
export class CollectionItemService {
  constructor(
    @InjectRepository(CollectionItem)
    private repo: MongoRepository<CollectionItem>,
    private config: ConfigService,
  ) {}

  private bucket = this.config.getOrThrow('AWS_S3_COLLECTIONS_BUCKET');
  private s3 = new S3({
    region: this.config.getOrThrow('AWS_REGION'),
    credentials: {
      accessKeyId: this.config.getOrThrow('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.config.getOrThrow('AWS_ACCESS_KEY_SECRET'),
    },
  });

  async findOne(collectionId: string, itemId: string, withDeleted = false) {
    const item = await this.repo.findOne({
      withDeleted,
      where: {
        collectionId: { $eq: new ObjectId(collectionId) },
        _id: { $eq: new ObjectId(itemId) },
      },
    });

    if (!item) {
      throw new NotFoundException('ITEM_NOT_FOUND');
    }

    return item;
  }

  private filter(options: ListCollectionItemDto) {
    const where: MongoFindManyOptions<Collection>['where'] = { $and: [] };

    if (options) {
      const { deleted } = options;

      if (deleted === 'true') {
        where.$and.push({
          deletedAt: { $ne: null, $exists: true },
        });
      }
    }

    return where;
  }

  async findAll(collectionId: string, options?: ListCollectionItemDto) {
    const where = this.filter(options);

    where.$and.push({
      collectionId: new ObjectId(collectionId),
    });

    return this.repo.find({
      where,
      order: { position: 'DESC' },
      withDeleted: options?.deleted === 'true',
    });
  }

  async upload(collectionId: string, image: Buffer) {
    const imageKey = uuidv4();

    // upload image to S3
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: imageKey,
        Body: image,
      }),
    );

    // get maximum position
    const maxPositionAggregator = this.repo.aggregate([
      { $match: { collectionId: new ObjectId(collectionId) } },
      { $group: { _id: null, position: { $max: '$position' } } },
    ]);
    const maxPositionResult = await maxPositionAggregator.toArray();
    const maxPosition = maxPositionResult[0]?.position || 0;

    return this.repo.save(
      this.repo.create({
        collectionId: new ObjectId(collectionId),
        descriptionEnUs: '',
        descriptionPtBr: '',
        imageKey,
        position: maxPosition + 1,
        deletedAt: null,
      }),
    );
  }

  async update(collectionId: string, itemId: string, dto: CollectionItemDto) {
    const item = await this.findOne(collectionId, itemId, true);
    item.descriptionEnUs = dto.descriptionEnUs;
    item.descriptionPtBr = dto.descriptionPtBr;

    return this.repo.save(item);
  }

  async delete(collectionId: string, itemId: string) {
    const item = await this.findOne(collectionId, itemId, true);
    await this.repo.softRemove(item);
  }

  async restore(collectionId: string, itemId: string) {
    const item = await this.findOne(collectionId, itemId, true);
    await this.repo.recover(item);
  }

  async sort(collectionId: string, items: CollectionItemPosition[]) {
    for (const positionItem of items) {
      const item = await this.findOne(collectionId, positionItem.id, true);
      item.position = positionItem.position;
      await this.repo.save(item);
    }
  }
}
