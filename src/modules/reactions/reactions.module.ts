import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReactionEntity } from './entities/reactions.entity';
import { Post } from '../post/entities/post.entity';

import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReactionEntity, Post])],
  controllers: [ReactionsController],
  providers: [ReactionsService],
})
export class ReactionsModule {}