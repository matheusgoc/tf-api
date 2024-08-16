import { IsEnum, IsString } from 'class-validator';

import { USER_ROLE } from '../../../entities/user.entity';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsEnum(USER_ROLE)
  role: USER_ROLE;
}
