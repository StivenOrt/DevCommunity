import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity]), NotificationsModule],
  providers: [PostService],
  controllers: [PostController],
  exports: [TypeOrmModule, PostService],
})
export class PostModule {}