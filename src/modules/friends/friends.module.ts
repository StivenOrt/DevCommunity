import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendshipEntity } from './entities/friendship.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FriendshipEntity])],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService], // ChatModule lo necesitará
})
export class FriendsModule {}
