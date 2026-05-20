import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendshipEntity } from './entities/friendship.entity';
import { UserEntity } from '../users/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FriendshipEntity, UserEntity])],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}