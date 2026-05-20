import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MailModule } from '../../common/Mail/mail.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    UsersModule,
    MailModule
  ],
  providers: [PostService],
  controllers: [PostController],
  exports: [TypeOrmModule, PostService],
})
export class PostModule {}