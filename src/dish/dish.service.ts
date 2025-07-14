import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DishRepository } from './repositories/dish.repository';
import { RestaurantRepository } from 'src/restaurant/repositories/restaurant.repository';
import { CreateDishDto } from './dto/create-dish.dto';
import { DishResponseDto } from './dto/response-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Dish } from './entities/dish.entity';


@Injectable()
export class DishService {
  constructor(
    private readonly dishRepository: DishRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async create(createDishDto: CreateDishDto): Promise<DishResponseDto> {
    const restaurantExists = await this.restaurantRepository.exists(createDishDto.restaurantId);
    if (!restaurantExists) {
      throw new BadRequestException(`Restaurant with ID ${createDishDto.restaurantId} does not exist`);
    }

    const dish = await this.dishRepository.create(createDishDto);
    return this.toResponseDto(dish);
  }

  async findAll(): Promise<DishResponseDto[]> {
    const dishes = await this.dishRepository.findAll();
    return dishes.map(dish => this.toResponseDto(dish));
  }

  async findById(id: number): Promise<DishResponseDto> {
    const dish = await this.dishRepository.findById(id);
    if (!dish) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }
    return this.toResponseDto(dish);
  }

  async findByRestaurantId(restaurantId: number): Promise<DishResponseDto[]> {
    const restaurantExists = await this.restaurantRepository.exists(restaurantId);
    if (!restaurantExists) {
      throw new BadRequestException(`Restaurant with ID ${restaurantId} does not exist`);
    }

    const dishes = await this.dishRepository.findByRestaurantId(restaurantId);
    return dishes.map(dish => this.toResponseDto(dish));
  }

  async findByName(name: string): Promise<DishResponseDto[]> {
    const dishes = await this.dishRepository.findByName(name);
    return dishes.map(dish => this.toResponseDto(dish));
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<DishResponseDto[]> {
    if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
      throw new BadRequestException('Invalid price range');
    }

    const dishes = await this.dishRepository.findByPriceRange(minPrice, maxPrice);
    return dishes.map(dish => this.toResponseDto(dish));
  }

  async findByTags(tags: string[]): Promise<DishResponseDto[]> {
    if (!tags || tags.length === 0) {
      throw new BadRequestException('At least one tag is required');
    }

    const dishes = await this.dishRepository.findByTags(tags);
    return dishes.map(dish => this.toResponseDto(dish));
  }

  async findByAllergens(allergens: string[]): Promise<DishResponseDto[]> {
    if (!allergens || allergens.length === 0) {
      throw new BadRequestException('At least one allergen is required');
    }

    const dishes = await this.dishRepository.findByAllergens(allergens);
    return dishes.map(dish => this.toResponseDto(dish));
  }

  async update(id: number, updateDishDto: UpdateDishDto): Promise<DishResponseDto> {
    const dish = await this.dishRepository.findById(id);
    if (!dish) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }

    const updatedDish = await this.dishRepository.update(id, updateDishDto);
    return this.toResponseDto(updatedDish);
  }

  async delete(id: number): Promise<void> {
    const dish = await this.dishRepository.findById(id);
    if (!dish) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }
    await this.dishRepository.delete(id);
  }

  async deleteByRestaurantId(restaurantId: number): Promise<void> {
    const restaurantExists = await this.restaurantRepository.exists(restaurantId);
    if (!restaurantExists) {
      throw new BadRequestException(`Restaurant with ID ${restaurantId} does not exist`);
    }
    await this.dishRepository.deleteByRestaurantId(restaurantId);
  }

  private toResponseDto(dish: Dish): DishResponseDto {
    return {
      id: dish.id,
      restaurantId: dish.restaurantId,
      name: dish.name,
      description: dish.description,
      price: dish.price,
      imageUrl: dish.imageUrl,
      ingredients: dish.ingredients,
      tags: dish.tags,
      allergens: dish.allergens,
    };
  }
}