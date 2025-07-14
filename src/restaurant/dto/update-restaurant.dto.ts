import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateRestaurantDto {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsString()
    address?: string;
  
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 8 })
    @Type(() => Number)
    latitude?: number;
  
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 8 })
    @Type(() => Number)
    longitude?: number;
  
    @IsOptional()
    @IsString()
    workingHours?: string;
  
    @IsOptional()
    @IsString()
    phone?: string;
  
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(4)
    @Type(() => Number)
    priceRange?: number;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    atmosphere?: string[];
  }