import { Test, TestingModule } from '@nestjs/testing';

import { CollectionItemController } from '@/modules/collection/collection-item.controller';

describe('CollectionItemController', () => {
  let controller: CollectionItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionItemController],
    }).compile();

    controller = module.get<CollectionItemController>(CollectionItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
