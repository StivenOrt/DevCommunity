import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostEntity } from './entities/post.entity';

import { PostController } from './post.controller';
import { PostService } from './post.service';
import { NotificationsModule } from '../notifications/notifications.module';

import { UsersModule } from '../users/users.module';

/* ─── NUEVO: módulos necesarios para notificaciones ─── */
import { FriendsModule } from '../friends/friends.module';
import { MailModule } from 'src/Mail/mail.module';

/* ─── NUEVO: listener de notificaciones ─── */
import { PostNotificationListener } from './listeners/post-notification.listener';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity]), NotificationsModule],
  providers: [PostService],
  controllers: [PostController],

  exports: [
    TypeOrmModule,
    PostService,
  ],
})
export class PostModule {}