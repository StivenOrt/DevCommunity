import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ensureExists } from 'src/common/utils/assertion.util';
import { POST_ERRORS } from 'src/common/constants/error-messages';
import { UsersService } from '../users/users.service';
import { MailService } from 'src/common/Mail/mail.service';
import { FriendsService } from '../friends/friends.service';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly mailService: MailService,
    private readonly userRepository: UsersService,
    private readonly friendsService: FriendsService,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<PostEntity> {
    const { authorUuid, ...newData } = createPostDto;
    const author = await this.userRepository.findOneBy.uuid(authorUuid);
    const newPostData: Partial<PostEntity> = { ...newData, author };
    const newPost = this.postRepository.create(newPostData);
    const savedPost = await this.postRepository.save(newPost);

    // Obtener amigos del autor y enviar notificaciones
    const friends = await this.friendsService.getMyFriends(author);
    
    const uniqueEmails = [...new Set(
      friends.map(friend => friend.email)
    )];

    await Promise.all(
      uniqueEmails.map(async (email) => {
        try {
          await this.mailService.sendNewPostNotification(
            email,
            author.username,
            savedPost.title,
            savedPost.content,
          );
        } catch (error) {
          this.logger.error(`Error enviando notificación a ${email}`, error as Error);
        }
      })
    );

    return savedPost;
  }

  async getAllPosts(): Promise<PostEntity[]> {
    return ensureExists(
      await this.postRepository.find(),
      new NotFoundException(POST_ERRORS.NOT_FOUND()),
    );
  }

  getOneBy = {
    id: async (id: number): Promise<PostEntity> => {
      return ensureExists(
        await this.postRepository.findOneBy({ id }),
        new NotFoundException(POST_ERRORS.NOT_FOUND()),
      );
    },
    uuid: async (uuid: string): Promise<PostEntity> => {
      return ensureExists(
        await this.postRepository.findOne({
          where: { uuid },
        }),
        new NotFoundException(POST_ERRORS.NOT_FOUND()),
      );
    },
  };

  async updatePost(uuid: string, updatePostDto: UpdatePostDto): Promise<PostEntity> {
    const { authorUuid, ...newData } = updatePostDto;
    const postData: Partial<PostEntity> = { ...newData };
    const post = await this.getOneBy.uuid(uuid);
    const updatePost = this.postRepository.merge(post, postData);
    return this.postRepository.save(updatePost);
  }

  async deletePost(uuid: string, idRolUsuario: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { uuid },
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