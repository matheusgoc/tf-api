import { IsNotEmpty, IsString } from 'class-validator';

export class CollectionDto {
  @IsNotEmpty()
  @IsString()
  titlePtBr: string;

  @IsNotEmpty()
  @IsString()
  titleEnUs: string;

  @IsString()
  subtitlePtBr?: string;

  @IsString()
  subtitleEnUs?: string;
}
