import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // ← agregado
import { Repository } from 'typeorm';
import { Comment } from './entities/comments.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async create(user: any, dto: CreateCommentDto) {
    const comment = this.commentRepository.create({
      content: dto.content,
      author: { id: user.id },
      post: { id: dto.postId },
    });
    return this.commentRepository.save(comment);
  }

  async findByPost(postId: number, page: number = 1) {
    const limit = 5;
    const [comments, total] = await this.commentRepository.findAndCount({
      where: {
        post: { id: postId },
      },
      relations: ['author'],
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: comments,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async update(user: any, commentId: number, dto: UpdateCommentDto) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    comment.content = dto.content;
    return this.commentRepository.save(comment);
  }

  async remove(user: any, commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.author.id !== user.id && user.rol !== 'moderator') {
      throw new ForbiddenException('Not allowed to delete this comment');
    }
    return this.commentRepository.remove(comment);
  }
}