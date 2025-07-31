import { IsBooleanString, IsOptional } from 'class-validator';

export class ShowCollectionDto {
  @IsOptional()
  @IsBooleanString()
  withItems?: string | number;
}
