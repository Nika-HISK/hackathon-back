import { DishResponseDto } from '../../dish/dto/response-dish.dto';

export class RestaurantResponseDto {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  workingHours: string;
  phone: string;
  priceRange: number;
  atmosphere: string[];
  dishes?: DishResponseDto[];
}
