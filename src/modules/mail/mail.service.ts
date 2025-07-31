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
    const bucket = this.config.getOrThrow('AWS_S3_ASSETS_BUCKET');
    const region = this.config.getOrThrow('AWS_REGION');
    this.context = {
      siteUrl: this.generateFrontendLink(''),
      s3Url: this.generateS3Url(bucket, region),
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
