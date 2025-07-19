import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDishDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  restaurantId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  ingredients: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens: string[];
}
