import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MailModule } from '../../common/Mail/mail.module';
import { UsersModule } from '../users/users.module';
import { FriendsModule } from '../friends/friends.module';
import { PostNotificationListener } from './listeners/post-notification.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    UsersModule,
    MailModule,
    FriendsModule,
  ],
  providers: [PostService, PostNotificationListener],
  controllers: [PostController],
  exports: [TypeOrmModule, PostService],
})
export class PostModule {}