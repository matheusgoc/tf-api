import { Test, TestingModule } from '@nestjs/testing';

import { ConsoleLogService } from './console-log.service';

describe('ConsoleLogService', () => {
  let service: ConsoleLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsoleLogService],
    }).compile();

    service = module.get<ConsoleLogService>(ConsoleLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
