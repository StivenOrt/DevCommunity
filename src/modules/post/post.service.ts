import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { ensureExists } from 'src/common/utils/assertion.util';
import { POST_ERRORS } from 'src/common/constants/error-messages';
import { UsersService } from '../users/users.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { MailService } from 'src/common/Mail/mail.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly mailService: MailService,

        private readonly userRepository: UsersService
  ) {}

    async createPost(createPostDto: CreatePostDto): Promise<PostEntity> {

        const { authorUuid, ...newData } = createPostDto;

        const newPostData: Partial<PostEntity> = { ...newData }

        newPostData.author = await this.userRepository.findOneBy.uuid(authorUuid)

        const newPost = this.postRepository.create(newPostData);

        return this.postRepository.save(newPost);
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
                new NotFoundException( POST_ERRORS.NOT_FOUND() )
            )

        },

        uuid: async(uuid: string): Promise<PostEntity> => {

            return ensureExists(
                await this.postRepository.findOne({
                    where: { uuid }
                }),
                new NotFoundException( POST_ERRORS.NOT_FOUND() )
            )
        }
    }

    async updatePost(uuid: string, updatePostDto: UpdatePostDto): Promise<PostEntity> {

        const { authorUuid, ...newData } = updatePostDto;

        const postData: Partial<PostEntity> = { ...newData }

        const post = await this.getOneBy.uuid(uuid)

        const updatePost = this.postRepository.merge(post, postData)

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