import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, IsUrl, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDishDto {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Type(() => Number)
    price?: number;
  
    @IsOptional()
    @IsString()
    @IsUrl()
    imageUrl?: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    ingredients?: string[];
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergens?: string[];
  }