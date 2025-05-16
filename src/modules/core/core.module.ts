import { Module } from '@nestjs/common';

import { EncryptionService } from './encryption/encryption.service';
import { BaseService } from './base/base.service';
import { ConsoleLogService } from './logger/console-log/console-log.service';
import { I18nService } from '@/modules/core/i18n/i18n.service';

@Module({
  providers: [BaseService, EncryptionService, ConsoleLogService, I18nService],
  exports: [BaseService, EncryptionService, ConsoleLogService, I18nService],
})
export class CoreModule {}
