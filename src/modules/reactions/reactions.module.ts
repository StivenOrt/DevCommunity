import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Reaction } from './entities/reactions.entity';
import { Post } from '../post/entities/post.entity';

import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction, Post])],
  controllers: [ReactionsController],
  providers: [ReactionsService],
})
export class ReactionsModule {}