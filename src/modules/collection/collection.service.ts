import { Injectable, NotFoundException } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { MongoFindManyOptions } from 'typeorm/find-options/mongodb/MongoFindManyOptions';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';

import { CollectionDto } from '@/modules/collection/dto/collection.dto';
import { Collection } from '@/entities/collection.entity';
import { ListCollectionDto } from '@/modules/collection/dto/list-collection.dto';
import { PageDto, PageMetaDto } from '@/modules/core/dto/page-options.dto';
import { BaseService } from '@/modules/core/base/base.service';
import { CollectionItemService } from '@/modules/collection/collection-item.service';
import { ShowCollectionDto } from '@/modules/collection/dto/show-collection.dto';

@Injectable()
export class CollectionService extends BaseService {
  constructor(
    @InjectRepository(Collection) private repo: MongoRepository<Collection>,
    private itemService: CollectionItemService,
  ) {
    super();
  }

  private filter(options: ListCollectionDto) {
    const { published } = options;
    const where: MongoFindManyOptions<Collection>['where'] = { $and: [] };

    if (published) {
      // unpublished collections
      if (published === 'false') {
        where.$and.push({
          $or: [
            { publishedAt: { $eq: null } },
            { publishedAt: { $exists: false } },
          ],
        });
      }

      // published collections
      else {
        where.$and.push({
          publishedAt: { $ne: null, $exists: true },
        });
      }
    }

    return where.$and.length > 0 ? where : undefined;
  }

  private async populateItems(collection: Collection) {
    const items = await this.itemService.findAll(collection.id.toString());
    return { ...collection, items };
  }

  async findAll(options: ListCollectionDto): Promise<PageDto<Collection>> {
    const order = this.mapSort<Collection>(options.order, {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      publishedAt: 'publishedAt',
    });

    const [entities, itemCount] = await this.repo.findAndCount({
      skip: (options.page - 1) * options.take,
      take: options.take,
      order,
      where: this.filter(options),
      select: [
        'id',
        'titleEnUs',
        'titlePtBr',
        'subtitlePtBr',
        'subtitleEnUs',
        'createdAt',
        'updatedAt',
        'publishedAt',
      ],
    });

    const pageMetaData = new PageMetaDto({
      pageOptionsDto: options,
      itemCount,
    });

    // load collections' items case requested
    if (options.withItems && options.withItems !== 'false') {
      for (const [key, collection] of Object.entries(entities)) {
        entities[key] = await this.populateItems(collection);
      }
    }

    return new PageDto(entities, pageMetaData);
  }

  async findOne(id: string, options?: ShowCollectionDto) {
    let collection = await this.repo.findOneBy({
      _id: { $eq: new ObjectId(id) },
    });

    if (!collection) {
      throw new NotFoundException('COLLECTION_NOT_FOUND');
    }

    if (options?.withItems && options.withItems !== 'false') {
      collection = await this.populateItems(collection);
    }

    return collection;
  }

  async create(dto: CollectionDto) {
    return this.repo.save(
      this.repo.create({
        titleEnUs: dto.titleEnUs,
        titlePtBr: dto.titlePtBr,
        subtitleEnUs: dto.subtitleEnUs,
        subtitlePtBr: dto.subtitlePtBr,
        publishedAt: null,
      }),
    );
  }

  async update(id: string, dto: CollectionDto) {
    const collection = await this.findOne(id);
    collection.titlePtBr = dto.titlePtBr;
    collection.titleEnUs = dto.titleEnUs;
    collection.subtitlePtBr = dto.subtitlePtBr;
    collection.subtitleEnUs = dto.subtitleEnUs;

    return this.repo.save(collection);
  }

  async publish(id: string) {
    const collection = await this.findOne(id);
    collection.publishedAt = new Date();

    return this.repo.save(collection);
  }

  async unpublish(id: string) {
    const collection = await this.findOne(id);
    collection.publishedAt = null;

    return this.repo.save(collection);
  }
}
