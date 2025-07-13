import { UserPreferences } from 'src/preferences/entities/user-preference.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('user')
export class User {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'userName', type: 'varchar', nullable: false })
  userName: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @OneToMany(() => UserPreferences, (preferences) => preferences.user)
  preferences: UserPreferences[];
}