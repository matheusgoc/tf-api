import { IsBooleanString, IsOptional } from 'class-validator';

import { PageOptionsDto } from '../../core/dto/page-options.dto';

export class ListCollectionDto extends PageOptionsDto {
  @IsOptional()
  @IsBooleanString()
  published?: string | number;

  @IsOptional()
  @IsBooleanString()
  withItems?: string | number;
}
