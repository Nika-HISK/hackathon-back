import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from '../entities/dish.entity';
import { CreateDishDto } from '../dto/create-dish.dto';
import { UpdateDishDto } from '../dto/update-dish.dto';

@Injectable()
export class DishRepository {
  constructor(
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
  ) {}

  async create(createDishDto: CreateDishDto): Promise<Dish> {
    const dish = this.dishRepository.create(createDishDto);
    return await this.dishRepository.save(dish);
  }

  async findAll(): Promise<Dish[]> {
    return await this.dishRepository.find({
      relations: ['restaurant'],
    });
  }

  async findById(id: number): Promise<Dish | null> {
    return await this.dishRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });
  }

  async findByRestaurantId(restaurantId: number): Promise<Dish[]> {
    return await this.dishRepository.find({
      where: { restaurantId },
      relations: ['restaurant'],
    });
  }

  async findByName(name: string): Promise<Dish[]> {
    return await this.dishRepository.find({
      where: { name },
      relations: ['restaurant'],
    });
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Dish[]> {
    return await this.dishRepository
      .createQueryBuilder('dish')
      .where('dish.price >= :minPrice', { minPrice })
      .andWhere('dish.price <= :maxPrice', { maxPrice })
      .leftJoinAndSelect('dish.restaurant', 'restaurant')
      .getMany();
  }

  async findByTags(tags: string[]): Promise<Dish[]> {
    const query = this.dishRepository
      .createQueryBuilder('dish')
      .leftJoinAndSelect('dish.restaurant', 'restaurant');

    tags.forEach((tag, index) => {
      query.andWhere(`JSON_CONTAINS(dish.tags, :tag${index})`, {
        [`tag${index}`]: `"${tag}"`,
      });
    });

    return await query.getMany();
  }

  async findByAllergens(allergens: string[]): Promise<Dish[]> {
    const query = this.dishRepository
      .createQueryBuilder('dish')
      .leftJoinAndSelect('dish.restaurant', 'restaurant');

    allergens.forEach((allergen, index) => {
      query.andWhere(`NOT JSON_CONTAINS(dish.allergens, :allergen${index})`, {
        [`allergen${index}`]: `"${allergen}"`,
      });
    });

    return await query.getMany();
  }

  async update(id: number, updateDishDto: UpdateDishDto): Promise<Dish | null> {
    await this.dishRepository.update(id, updateDishDto);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.dishRepository.delete(id);
  }

  async deleteByRestaurantId(restaurantId: number): Promise<void> {
    await this.dishRepository.delete({ restaurantId });
  }
}
