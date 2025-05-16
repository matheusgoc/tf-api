import { Test, TestingModule } from '@nestjs/testing';

import { UserMailService } from './user-mail.service';

describe('MailService', () => {
  let service: UserMailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserMailService],
    }).compile();

    service = module.get<UserMailService>(UserMailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
