import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(dto: CreatePostDto, userId: number) {
    const post = this.postRepository.create({
      ...dto,
      authorId: userId,
    });

    return this.postRepository.save(post);
  }

  async findAll() {
    return this.postRepository.find({
      relations: ['author'],
    });
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) throw new NotFoundException('Post not found');

    return post;
  }
}