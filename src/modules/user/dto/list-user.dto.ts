import { IsBooleanString, IsEnum, IsOptional, IsString } from 'class-validator';

import { PageOptionsDto } from '../../core/dto/page-options.dto';
import { USER_ROLE } from '../../../entities/user.entity';

export class ListUserDto extends PageOptionsDto {
  @IsOptional()
  @IsEnum(USER_ROLE)
  role?: USER_ROLE;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBooleanString()
  inactive?: string | number;
}
