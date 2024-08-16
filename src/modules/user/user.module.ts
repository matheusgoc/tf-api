import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../../entities/user.entity';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CoreModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
