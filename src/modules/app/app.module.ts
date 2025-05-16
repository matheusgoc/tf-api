import { ConsoleLogger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandRunnerModule } from 'nest-commander';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  SeedUserCommand,
  SeedUserProceedPrompt,
  SeedUserUserInfoPrompt,
  SeedUserUserPasswordPrompt,
} from '../../commands/seed-user.command';
import { UserModule } from '../../modules/user/user.module';
import { CoreModule } from '../core/core.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '@/modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        database: configService.get('DB_NAME'),
        entities: ['dist/entities/**/*.entity.js'],
        autoLoadEntities: true,
      }),
    }),
    CommandRunnerModule.forModule(),
    AppModule,
    CoreModule,
    UserModule,
    AuthModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ConsoleLogger,
    ConfigService,
    SeedUserCommand,
    SeedUserProceedPrompt,
    SeedUserUserInfoPrompt,
    SeedUserUserPasswordPrompt,
  ],
})
export class AppModule {}
