import { Equals, IsJWT, IsStrongPassword, ValidateIf } from 'class-validator';

import { UNAUTHORIZED_REASON } from '../auth.service';

export class EnrollDto {
  @IsJWT({ message: UNAUTHORIZED_REASON.INVALID_TOKEN })
  token: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password!: string;

  @ValidateIf((o) => o.password !== o.confirmPassword)
  @Equals('wrong-password', {
    message: 'confirm password does not match the password',
  })
  confirmPassword: string;
}
