import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CollectionItemPosition {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  position: number;
}

export class CollectionItemOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionItemPosition)
  @IsNotEmpty()
  items: CollectionItemPosition[];
}
