import { BaseEntity } from 'src/common/baseEntity';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('dishes')
export class Dish extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'restaurant_id', type: 'integer', nullable: false })
  restaurantId: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ name: 'image_url', type: 'text', nullable: false })
  image_url: string;

  @Column({ type: 'json', nullable: false })
  ingredients: string[];

  @Column({ type: 'json', nullable: false })
  tags: string[];

  @Column({ type: 'json', nullable: false })
  allergens: string[];

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.dishes)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
