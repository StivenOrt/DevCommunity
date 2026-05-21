import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoleModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { PostModule } from './modules/post/post.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ReactionsModule } from './modules/reactions/reactions.module';
import { MailModule } from './Mail/mail.module';
import { FriendsModule } from './modules/friends/friends.module';
import { ChatModule } from './modules/chat/chat.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'public')
    }),
    DatabaseModule,
    AuthModule,
    RoleModule,
    UsersModule,
    PostModule,
    CommentsModule,
    ReactionsModule,
    MailModule,
    FriendsModule,
    ChatModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
