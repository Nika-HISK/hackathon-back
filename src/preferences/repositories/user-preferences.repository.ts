import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserPreferencesDto } from '../dto/create-preference.dto';
import { UserPreferences } from '../entities/user-preference.entity';
import { UpdateUserPreferencesDto } from '../dto/update-preference.dto';

@Injectable()
export class UserPreferencesRepository {
  constructor(
    @InjectRepository(UserPreferences)
    private readonly userPreferencessRepository: Repository<UserPreferences>,
  ) {}

  async create(createUserPreferencessDto: CreateUserPreferencesDto): Promise<UserPreferences> {
    const Preferencess = this.userPreferencessRepository.create(createUserPreferencessDto);
    return await this.userPreferencessRepository.save(Preferencess);
  }

  async findAll(): Promise<UserPreferences[]> {
    return await this.userPreferencessRepository.find({
      relations: ['user'],
    });
  }

  async findById(id: number): Promise<UserPreferences | null> {
    return await this.userPreferencessRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(userId: number): Promise<UserPreferences[]> {
    return await this.userPreferencessRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async update(id: number, UpdateUserPreferencesDto: UpdateUserPreferencesDto): Promise<UserPreferences | null> {
    await this.userPreferencessRepository.update(id, UpdateUserPreferencesDto);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.userPreferencessRepository.delete(id);
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.userPreferencessRepository.delete({ userId });
  }
}