import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { ensureExists } from 'src/common/utils/assertion.util';
import { POST_ERRORS } from 'src/common/constants/error-messages';
import { UsersService } from '../users/users.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostCreatedEvent } from './events/post-created.event';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(PostEntity)
            private readonly postRepository: Repository<PostEntity>,

        private readonly userRepository: UsersService,
        
        private readonly eventEmitter: EventEmitter2
    ) {}

    async createPost(createPostDto: CreatePostDto): Promise<PostEntity> {

        const { authorUuid, ...newData } = createPostDto;

        const newPostData: Partial<PostEntity> = { ...newData }

        newPostData.author = await this.userRepository.findOneBy.uuid(authorUuid)

        const newPost = this.postRepository.create(newPostData);

        const savedPost = await this.postRepository.save(newPost);
        this.eventEmitter.emit('post.created', new PostCreatedEvent(savedPost));

        return savedPost;
    }

    async getAllPosts(): Promise<PostEntity[]> {
        return ensureExists(
            await this.postRepository.find(),
            new NotFoundException( POST_ERRORS.NOT_FOUND() )
        )
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

    async deletePost(uuid: string): Promise<void> {

        const post = ensureExists(
            await this.getOneBy.uuid(uuid),
            new NotFoundException(POST_ERRORS.NOT_FOUND())
        )

        await this.postRepository.remove(post);
    }
}
