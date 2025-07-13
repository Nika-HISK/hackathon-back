import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from 'src/users/repositories/user.repository';
import { CreateUserPreferencesDto } from './dto/create-preference.dto';
import { UpdateUserPreferencesDto } from './dto/update-preference.dto';
import { UserPreferences } from './entities/user-preference.entity';
import { UserPreferencesRepository } from './repositories/user-preferences.repository';
import { UserPreferencesResponseDto } from './dto/response-preference';


@Injectable()
export class UserPreferencesService {
  constructor(
    private readonly userPreferencesRepository: UserPreferencesRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(createUserPreferencessDto: CreateUserPreferencesDto): Promise<UserPreferencesResponseDto> {
    const userExists = await this.userRepository.exists(createUserPreferencessDto.userId);
    if (!userExists) {
      throw new BadRequestException(`User with ID ${createUserPreferencessDto.userId} does not exist`);
    }

    const preferences = await this.userPreferencesRepository.create(createUserPreferencessDto);
    return this.toResponseDto(preferences);
  }

  async findAll(): Promise<UserPreferencesResponseDto[]> {
    const preferences = await this.userPreferencesRepository.findAll();
    return preferences.map(pref => this.toResponseDto(pref));
  }

  async findById(id: number): Promise<UserPreferencesResponseDto> {
    const preferences = await this.userPreferencesRepository.findById(id);
    if (!preferences) {
      throw new NotFoundException(`User Preferences with ID ${id} not found`);
    }
    return this.toResponseDto(preferences);
  }

  async findByUserId(userId: number): Promise<UserPreferencesResponseDto[]> {
    const userExists = await this.userRepository.exists(userId);
    if (!userExists) {
      throw new BadRequestException(`User with ID ${userId} does not exist`);
    }

    const preferences = await this.userPreferencesRepository.findByUserId(userId);
    return preferences.map(pref => this.toResponseDto(pref));
  }

  async update(id: number, updateUserPreferencesDto: UpdateUserPreferencesDto): Promise<UserPreferencesResponseDto> {
    const preferences = await this.userPreferencesRepository.findById(id);
    if (!preferences) {
      throw new NotFoundException(`User Preferences with ID ${id} not found`);
    }

    const updatedPreferences = await this.userPreferencesRepository.update(id, updateUserPreferencesDto);
    return this.toResponseDto(updatedPreferences);
  }

  async delete(id: number): Promise<void> {
    const preferences = await this.userPreferencesRepository.findById(id);
    if (!preferences) {
      throw new NotFoundException(`User Preferences with ID ${id} not found`);
    }
    await this.userPreferencesRepository.delete(id);
  }

  async deleteByUserId(userId: number): Promise<void> {
    const userExists = await this.userRepository.exists(userId);
    if (!userExists) {
      throw new BadRequestException(`User with ID ${userId} does not exist`);
    }
    await this.userPreferencesRepository.deleteByUserId(userId);
  }

  private toResponseDto(preferences: UserPreferences): UserPreferencesResponseDto {
    return {
      id: preferences.id,
      userId: preferences.userId,
      tag: preferences.tag,
      atmosphere: preferences.atmosphere,
      allergen: preferences.allergen,
    };
  }
}