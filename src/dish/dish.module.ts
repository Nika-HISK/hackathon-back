import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishRepository } from './repositories/dish.repository';
import { Dish } from './entities/dish.entity';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { DishService } from './dish.service';
import { DishController } from './dish.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dish]), RestaurantModule],
  controllers: [DishController],
  providers: [DishService, DishRepository],
  exports: [DishService, DishRepository],
})
export class DishModule {}
