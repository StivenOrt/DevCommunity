import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostEntity } from './entities/post.entity';

import { PostController } from './post.controller';
import { PostService } from './post.service';

import { UsersModule } from '../users/users.module';

/* ─── NUEVO: módulos necesarios para notificaciones ─── */
import { FriendsModule } from '../friends/friends.module';
import { MailModule } from 'src/Mail/mail.module';

/* ─── NUEVO: listener de notificaciones ─── */
import { PostNotificationListener } from './listeners/post-notification.listener';

@Module({
  imports: [

    TypeOrmModule.forFeature([PostEntity]),

    UsersModule,

    /* ─── NUEVO ───────────────────────────── */

    // necesario para obtener amigos del autor
    FriendsModule,

    // necesario para enviar correos
    MailModule,
  ],

  providers: [

    PostService,

    /* ─── NUEVO ───────────────────────────── */

    // listener que escucha cuando se crea un post
    PostNotificationListener,
  ],

  controllers: [PostController],

  exports: [
    TypeOrmModule,
    PostService,
  ],
})
export class PostModule {}