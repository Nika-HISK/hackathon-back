import { PartialType } from '@nestjs/mapped-types';
import { CreateUserPreferencesDto } from './create-preference.dto';

export class UpdateUserPreferencesDto extends PartialType(CreateUserPreferencesDto) {}
