import { ConfigService } from '@nestjs/config';

import { BaseService } from '@/modules/core/base/base.service';

interface MailContext extends Record<string, any> {
  siteUrl: string;
  s3Url: string;
}

export class MailService extends BaseService {
  protected context: MailContext;
  constructor(protected readonly config: ConfigService) {
    super();
    this.context = {
      siteUrl: this.generateFrontendLink(''),
      s3Url: `${this.config.getOrThrow('S3_ASSETS_URL')}`,
    };
  }
  protected generateFrontendLink(
    url: string,
    params?: Record<string, string | number>,
  ) {
    return this.generateLink(
      this.config.getOrThrow('FRONTEND_HOST'),
      url,
      params,
    );
  }
}
