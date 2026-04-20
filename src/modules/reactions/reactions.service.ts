import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reaction } from './entities/reactions.entity';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { Post } from '../post/entities/post.entity';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private reactionRepository: Repository<Reaction>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async addReaction(user: any, dto: CreateReactionDto) {
    const post = await this.postRepository.findOne({
      where: { id: dto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existing = await this.reactionRepository.findOne({
      where: {
        user: { id: user.id },
        post: { id: dto.postId },
      },
    });

    if (existing) {
      throw new BadRequestException('You already liked this post');
    }

    const reaction = this.reactionRepository.create({
      user: { id: user.id },
      post: { id: dto.postId },
    });

    const savedReaction = await this.reactionRepository.save(reaction);

    return {
      message: 'Like added successfully',
      data: savedReaction,
    };
  }

  async removeReaction(user: any, postId: number) {
    const reaction = await this.reactionRepository.findOne({
      where: {
        user: { id: user.id },
        post: { id: postId },
      },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    await this.reactionRepository.remove(reaction);

    return {
      message: 'Like removed successfully',
    };
  }

  async countReactions(postId: number) {
    return this.reactionRepository.count({
      where: {
        post: { id: postId },
      },
    });
  }
}