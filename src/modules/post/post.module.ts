import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostEntity } from './entities/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';

/* ─── MÓDULOS DEL SISTEMA ─── */
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { FriendsModule } from '../friends/friends.module';
import { MailModule } from 'src/Mail/mail.module';

/* ─── LISTENERS ─── */
import { PostNotificationListener } from './listeners/post-notification.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]), 
    NotificationsModule,
    UsersModule,    // 💡 IMPORTANTE: Permite a PostService usar el UsersService
    FriendsModule,  // Necesario si vas a manejar lógicas de amigos al crear posts
    MailModule,     // Necesario para las notificaciones por correo
  ],
  providers: [
    PostService, 
    PostNotificationListener // 💡 IMPORTANTE: Registramos el listener para que escuche los eventos de EventEmmiter
  ],
  controllers: [PostController],
  exports: [
    TypeOrmModule,
    PostService,
  ],
})
export class PostModule {}