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
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { RestaurantResponseDto } from './dto/response-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { plainToInstance } from 'class-transformer';
import SupraSearchEngine from './SupraMultiSearchEngine';
import { AiRestaurantSearchDto } from './dto/AiRestaurantSearchDto';
import path from 'path';
import { ImageSearchDto } from './dto/imageSearch.Dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';


@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService,
  ) {}

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

  @Post('search-ai')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  async aiSearch(
    @Body() body?: AiRestaurantSearchDto | ImageSearchDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<RestaurantResponseDto[]> {
    const engine = new SupraSearchEngine();
    
    // Load restaurant + dish data
    const restaurants = await this.restaurantService.findAll(); // includes dishes
    
    // Convert entities into raw JSON format (to send to AI)
    const dishList = restaurants.flatMap((r) =>
      r.dishes.map((d) => ({
        restaurant_id: r.id.toString(),
        restaurant_name: r.name,
        dish_name: d.name,
        dish_price: d.price,
      })),
    );
    
    // Inject data into AI engine
    engine['restaurantData'] = dishList; // hacky but effective since loadData reads from JSON
    
    let aiResponse;
    let tempPath: string | undefined;
    
    try {
      if (file) {
        // Image search path
        tempPath = `temp_${Date.now()}_${file.originalname}`;
        fs.writeFileSync(tempPath, file.buffer);
        
        const imageBody = body as ImageSearchDto;
        aiResponse = await engine.search(
          imageBody.text || '',
          tempPath,
          imageBody.preferences || '',
          imageBody.limit || 10
        );
      } else {
        // Text search path
        const textBody = body as AiRestaurantSearchDto;
        aiResponse = await engine.search(textBody.text);
      }
      
      if (aiResponse.status !== 'success' || !aiResponse.data) {
        return [];
      }
      
      // Map AI result (dish info) back to full restaurant info
      const matchedRestaurantIds = new Set(
        aiResponse.data.results.map((r) => parseInt(r.restaurant_id)),
      );
      const matchedDishes = new Set(
        aiResponse.data.results.map((r) => `${r.restaurant_id}-${r.dish_name}`),
      );
      
      const matchedRestaurants = restaurants
        .filter((r) => matchedRestaurantIds.has(r.id))
        .map((r) => {
          const filteredDishes = r.dishes.filter((d) =>
            matchedDishes.has(`${r.id}-${d.name}`),
          );
          return {
            ...r,
            dishes: filteredDishes,
          };
        });
      
      return plainToInstance(RestaurantResponseDto, matchedRestaurants);
    } finally {
      // Clean up temp file if it exists
      if (tempPath && fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
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
