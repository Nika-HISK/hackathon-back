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
  }