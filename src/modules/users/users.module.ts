import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RoleModule } from '../roles/roles.module';
import { UserSeederService } from 'src/seeders/user-seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    RoleModule
  ],
  controllers: [UsersController],
  providers: [UsersService, UserSeederService],
  exports: [UsersService],
})
export class UsersModule {}