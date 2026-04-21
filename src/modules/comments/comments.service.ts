import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from './entities/comments.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Post } from '../post/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  // ✅ Crear comentario
  async create(user: any, dto: CreateCommentDto) {
    const post = await this.postRepository.findOne({
      where: { id: dto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentRepository.create({
      content: dto.content,
      author: { id: user.id },
      post: { id: dto.postId },
    });

    return this.commentRepository.save(comment);
  }

  // ✅ Listar comentarios por post (CON PAGINACIÓN)
  async findByPost(postId: number, page: number = 1) {
    const limit = 5;

    const [comments, total] = await this.commentRepository.findAndCount({
      where: {
        post: { id: postId },
      },
      relations: ['author'], // opcional (muy útil)
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

  // ✅ Editar comentario
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

  // ✅ Eliminar comentario
  async remove(user: any, commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // autor o moderador
    if (
      comment.author.id !== user.id &&
      user.rol !== 'moderator'
    ) {
      throw new ForbiddenException('Not allowed to delete this comment');
    }

    return this.commentRepository.remove(comment);
  }
}