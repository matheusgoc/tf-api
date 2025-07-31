import { IsBooleanString, IsOptional } from 'class-validator';

import { PageOptionsDto } from '../../core/dto/page-options.dto';

export class ListCollectionItemDto extends PageOptionsDto {
  @IsOptional()
  @IsBooleanString()
  deleted?: string;
}
