import { IsEmail } from 'class-validator';

export class RememberPasswordDto {
  @IsEmail()
  email: string;
}
