import { Injectable, NotFoundException } from '@nestjs/common';
import { RestaurantRepository } from './repositories/restaurant.repository';
import { RestaurantResponseDto } from './dto/response-restaurant.dto';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';


@Injectable()
export class RestaurantService {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async create(createRestaurantDto: CreateRestaurantDto): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepository.create(createRestaurantDto);
    return this.toResponseDto(restaurant);
  }

  async findAll(): Promise<RestaurantResponseDto[]> {
    const restaurants = await this.restaurantRepository.findAll();
    return restaurants.map(restaurant => this.toResponseDto(restaurant));
  }

  async findById(id: number): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return this.toResponseDto(restaurant);
  }

  async findByName(name: string): Promise<RestaurantResponseDto[]> {
    const restaurants = await this.restaurantRepository.findByName(name);
    return restaurants.map(restaurant => this.toResponseDto(restaurant));
  }

  async findByPriceRange(priceRange: number): Promise<RestaurantResponseDto[]> {
    if (priceRange < 1 || priceRange > 5) {
      throw new NotFoundException('Price range must be between 1 and 5');
    }
    const restaurants = await this.restaurantRepository.findByPriceRange(priceRange);
    return restaurants.map(restaurant => this.toResponseDto(restaurant));
  }

  async findByLocation(latitude: number, longitude: number, radius: number = 1): Promise<RestaurantResponseDto[]> {
    const restaurants = await this.restaurantRepository.findByLocation(latitude, longitude, radius);
    return restaurants.map(restaurant => this.toResponseDto(restaurant));
  }

  async update(id: number, updateRestaurantDto: UpdateRestaurantDto): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    const updatedRestaurant = await this.restaurantRepository.update(id, updateRestaurantDto);
    return this.toResponseDto(updatedRestaurant);
  }

  async delete(id: number): Promise<void> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    await this.restaurantRepository.delete(id);
  }

  private toResponseDto(restaurant: Restaurant): RestaurantResponseDto {
    return {
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      workingHours: restaurant.workingHours,
      phone: restaurant.phone,
      priceRange: restaurant.priceRange,
      atmosphere: restaurant.atmosphere,
    };
  }
}