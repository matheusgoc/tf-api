import { Module } from '@nestjs/common';

import { EncryptionService } from './encryption/encryption.service';
import { BaseService } from './base/base.service';
import { ConsoleLogService } from './logger/console-log/console-log.service';

@Module({
  providers: [BaseService, EncryptionService, ConsoleLogService],
  exports: [BaseService, EncryptionService, ConsoleLogService],
})
export class CoreModule {}
