import {
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { UserProfileDto } from '../../../modules/user/dto/user-profile.dto';
import { USER_ROLE } from '../../../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsEnum(USER_ROLE)
  @IsNotEmpty()
  role: USER_ROLE;

  @ValidateNested()
  @Type(() => UserProfileDto)
  @IsNotEmptyObject()
  profile: UserProfileDto;
}
