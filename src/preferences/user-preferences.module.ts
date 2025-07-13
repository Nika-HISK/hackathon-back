import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { UserPreferences } from './entities/user-preference.entity';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreferencesRepository } from './repositories/user-preferences.repository';
import { UserPreferencesController } from './user-preferences.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPreferences]),
    UsersModule,
  ],
  controllers: [UserPreferencesController],
  providers: [UserPreferencesService, UserPreferencesRepository],
  exports: [UserPreferencesService, UserPreferencesRepository],
})
export class UserPreferencesModule {}