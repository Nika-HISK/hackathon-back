import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserPreferencesDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  atmosphere?: string;

  @IsOptional()
  @IsString()
  allergen?: string;
}
