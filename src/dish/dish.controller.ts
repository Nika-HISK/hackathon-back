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
  HttpCode
} from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { DishResponseDto } from './dto/response-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';



@Controller('dishes')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDishDto: CreateDishDto): Promise<DishResponseDto> {
    return await this.dishService.create(createDishDto);
  }

  @Get()
  async findAll(): Promise<DishResponseDto[]> {
    return await this.dishService.findAll();
  }

  @Get('search/name')
  async findByName(@Query('name') name: string): Promise<DishResponseDto[]> {
    return await this.dishService.findByName(name);
  }

  @Get('search/price-range')
  async findByPriceRange(
    @Query('minPrice', ParseFloatPipe) minPrice: number,
    @Query('maxPrice', ParseFloatPipe) maxPrice: number,
  ): Promise<DishResponseDto[]> {
    return await this.dishService.findByPriceRange(minPrice, maxPrice);
  }

  @Get('search/tags')
  async findByTags(@Query('tags') tags: string | string[]): Promise<DishResponseDto[]> {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    return await this.dishService.findByTags(tagArray);
  }

  @Get('search/allergens')
  async findByAllergens(@Query('allergens') allergens: string | string[]): Promise<DishResponseDto[]> {
    const allergenArray = Array.isArray(allergens) ? allergens : [allergens];
    return await this.dishService.findByAllergens(allergenArray);
  }

  @Get('restaurant/:restaurantId')
  async findByRestaurantId(@Param('restaurantId', ParseIntPipe) restaurantId: number): Promise<DishResponseDto[]> {
    return await this.dishService.findByRestaurantId(restaurantId);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<DishResponseDto> {
    return await this.dishService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDishDto: UpdateDishDto,
  ): Promise<DishResponseDto> {
    return await this.dishService.update(id, updateDishDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.dishService.delete(id);
  }

  @Delete('restaurant/:restaurantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteByRestaurantId(@Param('restaurantId', ParseIntPipe) restaurantId: number): Promise<void> {
    await this.dishService.deleteByRestaurantId(restaurantId);
  }
}