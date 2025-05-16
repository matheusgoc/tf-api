import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as dotenv from 'dotenv';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserMailService } from '@/modules/mail/user-mail.service';
import { CoreModule } from '@/modules/core/core.module';

dotenv.config();

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow('SMTP_HOST'),
          port: +config.getOrThrow('SMTP_PORT'),
          requireTLS: true,
          auth: {
            user: config.getOrThrow('SMTP_USERNAME'),
            pass: config.getOrThrow('SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: config.getOrThrow('SMTP_FROM'),
        },
        template: {
          dir: join(__dirname, '..', '..', 'mails'),
          adapter: new HandlebarsAdapter(undefined /* helpers */, {
            inlineCssEnabled: true,
            inlineCssOptions: {
              keepStyleTags: true,
            },
          }),
          options: {
            strict: true,
          },
        },
        options: {
          partials: {
            dir: join(__dirname, '..', '..', 'mails', 'partials'),
            options: {
              strict: true,
            },
          },
        },
      }),
      inject: [ConfigService],
    }),
    CoreModule,
  ],
  providers: [UserMailService],
  exports: [UserMailService],
})
export class MailModule {}
