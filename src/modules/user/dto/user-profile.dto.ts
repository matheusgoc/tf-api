import { IsIn, IsString } from 'class-validator';

import {
  USER_PROFILE_LANGUAGE,
  USER_PROFILE_REGION,
} from '../../../entities/user.entity';

export class UserProfileDto {
  @IsString()
  @IsIn(Object.values(USER_PROFILE_LANGUAGE))
  language: USER_PROFILE_LANGUAGE;

  @IsString()
  @IsIn(Object.values(USER_PROFILE_REGION))
  region: USER_PROFILE_REGION;
}
