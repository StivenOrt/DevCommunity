import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])], // ← esto falta
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // ← para que AuthModule pueda usarlo
})
export class UsersModule {}