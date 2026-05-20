import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentsEntity } from './entities/comments.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { MailService } from 'src/common/Mail/mail.service';
import { PostEntity } from '../post/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsEntity)
    private commentRepository: Repository<CommentsEntity>,
    private readonly mailService: MailService,
  ) {}

  async create(user: any, dto: CreateCommentDto) {
  const post = await this.commentRepository.manager.findOne(PostEntity, {
    where: { uuid: dto.postUuid },
  });

  if (!post) throw new NotFoundException('Post no encontrado');

  const comment = this.commentRepository.create({
    content: dto.content,
    author: { id: user.id },
    post: { id: post.id }, // TypeORM usa id internamente
  });

  return this.commentRepository.save(comment);
}

  async findByPost(postUuid: string, page: number = 1) {
    const limit = 5;
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { post: { uuid: postUuid } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
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

  async update(user: any, uuid: string, dto: UpdateCommentDto) {
    const comment = await this.commentRepository.findOne({
      where: { uuid },
      relations: ['author'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    comment.content = dto.content;
    return this.commentRepository.save(comment);
  }

  async remove(user: any, uuid: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { uuid },
      relations: ['author'],
    });
    if (!comment) throw new NotFoundException('Comment not found');

    const esModeradorOAdmin = ['1', '2'].includes(user.idRol.toString());
    if (esModeradorOAdmin) {
      await this.mailService.sendCommentEliminadoEmail(
        comment.author.email,
        comment.author.username,
        comment.content,
      );
    }

    await this.commentRepository.remove(comment);
  }
}