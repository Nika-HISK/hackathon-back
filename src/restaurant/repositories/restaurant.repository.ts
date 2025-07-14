import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateRestaurantDto } from '../dto/create-restaurant.dto';
import { UpdateRestaurantDto } from '../dto/update-restaurant.dto';

@Injectable()
export class RestaurantRepository {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const restaurant = this.restaurantRepository.create(createRestaurantDto);
    return await this.restaurantRepository.save(restaurant);
  }

  async findAll(): Promise<Restaurant[]> {
    return await this.restaurantRepository.find({
      relations: ['dishes'],
    });
  }

  async findById(id: number): Promise<Restaurant | null> {
    return await this.restaurantRepository.findOne({
      where: { id },
      relations: ['dishes'],
    });
  }

  async findByName(name: string): Promise<Restaurant[]> {
    return await this.restaurantRepository.find({
      where: { name: name },
      relations: ['dishes'],
    });
  }

  async findByPriceRange(priceRange: number): Promise<Restaurant[]> {
    return await this.restaurantRepository.find({
      where: { priceRange },
      relations: ['dishes'],
    });
  }

  async findByLocation(
    latitude: number,
    longitude: number,
    radius: number = 1,
  ): Promise<Restaurant[]> {
    const query = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .where('ABS(restaurant.latitude - :latitude) < :radius', {
        latitude,
        radius,
      })
      .andWhere('ABS(restaurant.longitude - :longitude) < :radius', {
        longitude,
        radius,
      })
      .leftJoinAndSelect('restaurant.dishes', 'dishes');

    return await query.getMany();
  }

  async update(
    id: number,
    updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant | null> {
    await this.restaurantRepository.update(id, updateRestaurantDto);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.restaurantRepository.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.restaurantRepository.count({ where: { id } });
    return count > 0;
  }
}
