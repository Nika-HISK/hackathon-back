import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRestaurantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Type(() => Number)
  latitude: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Type(() => Number)
  longitude: number;

  @IsNotEmpty()
  @IsString()
  workingHours: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  priceRange: number;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  atmosphere: string[];
}
