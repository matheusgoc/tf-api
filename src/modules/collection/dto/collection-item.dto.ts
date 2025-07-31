import { IsNotEmpty, IsString } from 'class-validator';

export class CollectionItemDto {
  @IsNotEmpty()
  @IsString()
  descriptionPtBr: string;

  @IsNotEmpty()
  @IsString()
  descriptionEnUs: string;
}
