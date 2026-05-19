import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RoleModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    RoleModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}