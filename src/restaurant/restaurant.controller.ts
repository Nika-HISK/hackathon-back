import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ParseFloatPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { RestaurantResponseDto } from './dto/response-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createRestaurantDto: CreateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return await this.restaurantService.create(createRestaurantDto);
  }

  @Get()
  async findAll(): Promise<RestaurantResponseDto[]> {
    return await this.restaurantService.findAll();
  }

  @Get('search/name')
  async findByName(
    @Query('name') name: string,
  ): Promise<RestaurantResponseDto[]> {
    return await this.restaurantService.findByName(name);
  }

  @Get('search/price-range')
  async findByPriceRange(
    @Query('range', ParseIntPipe) priceRange: number,
  ): Promise<RestaurantResponseDto[]> {
    return await this.restaurantService.findByPriceRange(priceRange);
  }

  @Get('search/location')
  async findByLocation(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
    @Query('radius', ParseFloatPipe) radius: number = 1,
  ): Promise<RestaurantResponseDto[]> {
    return await this.restaurantService.findByLocation(
      latitude,
      longitude,
      radius,
    );
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RestaurantResponseDto> {
    return await this.restaurantService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return await this.restaurantService.update(id, updateRestaurantDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.restaurantService.delete(id);
  }
}
