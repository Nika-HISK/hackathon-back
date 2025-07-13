import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';

import { UserPreferencesService } from './user-preferences.service';
import { CreateUserPreferencesDto } from './dto/create-preference.dto';
import { UserPreferencesResponseDto } from './dto/response-preference';
import { UpdateUserPreferencesDto } from './dto/update-preference.dto';

@Controller('user-preferences')
export class UserPreferencesController {
  constructor(
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createUserPreferencesDto: CreateUserPreferencesDto,
  ): Promise<UserPreferencesResponseDto> {
    return await this.userPreferencesService.create(createUserPreferencesDto);
  }

  @Get()
  async findAll(): Promise<UserPreferencesResponseDto[]> {
    return await this.userPreferencesService.findAll();
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserPreferencesResponseDto> {
    return await this.userPreferencesService.findById(id);
  }

  @Get('user/:userId')
  async findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserPreferencesResponseDto[]> {
    return await this.userPreferencesService.findByUserId(userId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserPreferencesDto: UpdateUserPreferencesDto,
  ): Promise<UserPreferencesResponseDto> {
    return await this.userPreferencesService.update(
      id,
      updateUserPreferencesDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userPreferencesService.delete(id);
  }

  @Delete('user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    await this.userPreferencesService.deleteByUserId(userId);
  }
}
