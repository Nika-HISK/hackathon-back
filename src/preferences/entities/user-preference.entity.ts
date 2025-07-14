import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_Preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: true })
  tag: string;

  @Column({ type: 'varchar', nullable: true })
  atmosphere: string;

  @Column({ type: 'varchar', nullable: true })
  allergen: string;

  @ManyToOne(() => User, (user) => user.preferences)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
