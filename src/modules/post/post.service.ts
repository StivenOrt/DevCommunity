import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { ensureExists } from 'src/common/utils/assertion.util';
import { POST_ERRORS } from 'src/common/constants/error-messages';
import { MailService } from 'src/common/Mail/mail.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly mailService: MailService,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<PostEntity> {
    const post = this.postRepository.create(createPostDto);
    return this.postRepository.save(post);
  }

  async getAllPosts(): Promise<PostEntity[]> {
    return ensureExists(
      await this.postRepository.find(),
      new NotFoundException(POST_ERRORS.NOT_FOUND()),
    );
  }

  async getPostById(id: number): Promise<PostEntity> {
    return ensureExists(
      await this.postRepository.findOneBy({ id }),
      new NotFoundException(POST_ERRORS.NOT_FOUND()),
    );
  }

  async updatePost(id: number, updatePostDto: CreatePostDto): Promise<PostEntity> {
    const post = ensureExists(
      await this.getPostById(id),
      new NotFoundException(POST_ERRORS.NOT_FOUND()),
    );
    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async deletePost(id: number, idRolUsuario: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) throw new NotFoundException(POST_ERRORS.NOT_FOUND());

    const esModeradorOAdmin = ['1', '2'].includes(idRolUsuario);
    if (esModeradorOAdmin) {
      await this.mailService.sendPostEliminadoEmail(
        post.author.email,
        post.author.username,
        post.title,
      );
    }

    await this.postRepository.remove(post);
  }
}