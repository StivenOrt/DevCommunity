import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostEntity } from './entities/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MailModule } from '../../common/Mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { FriendsModule } from '../friends/friends.module';


/* ─── LISTENERS ─── */
import { PostNotificationListener } from './listeners/post-notification.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    UsersModule,
    MailModule,
    NotificationsModule
  ],
  providers: [PostService],
  controllers: [PostController],
  exports: [
    TypeOrmModule,
    PostService,
  ],
})
export class PostModule {}