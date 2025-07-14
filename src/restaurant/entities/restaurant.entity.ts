import { Dish } from 'src/dish/entities/dish.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from 'typeorm';

@Entity('restaurants')
export class Restaurant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: false })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: false })
  longitude: number;

  @Column({ name: 'working_hours', type: 'text', nullable: false })
  workingHours: string;

  @Column({ type: 'varchar', nullable: false })
  phone: string;

  @Column({ name: 'price_range', type: 'smallint', nullable: false })
  priceRange: number;

  @Column({ type: 'json', nullable: false })
  atmosphere: string[];

  @OneToMany(() => Dish, (dish) => dish.restaurant)
  dishes: Dish[];
}
