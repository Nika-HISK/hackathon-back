export class DishResponseDto {
    id: number;
    restaurantId: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    ingredients: string[];
    tags: string[];
    allergens: string[];
  }