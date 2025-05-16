import { IsEnum, IsJWT } from 'class-validator';

import { AUTH_PURPOSE, UNAUTHORIZED_REASON } from '@/modules/auth/auth.service';

export class TokenVerifyDTO {
  @IsJWT({ message: UNAUTHORIZED_REASON.INVALID_TOKEN })
  token: string;

  @IsEnum(AUTH_PURPOSE, { message: UNAUTHORIZED_REASON.INVALID_TOKEN_PURPOSE })
  purpose: AUTH_PURPOSE;
}
