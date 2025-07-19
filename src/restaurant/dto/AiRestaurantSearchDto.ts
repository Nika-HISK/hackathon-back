import { IsString } from "class-validator";


export class AiRestaurantSearchDto {

  @IsString()
  text: string;
}
