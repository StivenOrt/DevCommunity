import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { RolsEnum } from 'src/common/enums/rols.enums';
import { ensureExists } from 'src/common/utils/assertion.util';
import { POST_ERRORS } from 'src/common/constants/error-messages';
import { CrudEnums } from 'src/common/enums/crud.enums';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(PostEntity)
            private readonly postRepository: Repository<PostEntity>,
    ) {}

    async createPost(createPostDto: CreatePostDto): Promise<PostEntity> {
        const post = this.postRepository.create(createPostDto);

        return this.postRepository.save(post);
    }

    async getAllPosts(): Promise<PostEntity[]> {
        return ensureExists(
            await this.postRepository.find(),
            new NotFoundException( POST_ERRORS.NOT_FOUND() )
        )
    }

    async getPostById(id: number): Promise<PostEntity> {
        return ensureExists(
            await this.postRepository.findOneBy({ id }),
            new NotFoundException( POST_ERRORS.NOT_FOUND() )
        )

    }

    async updatePost(id: number, updatePostDto: CreatePostDto, author: any): Promise<PostEntity> {
        const post = ensureExists(
            await this.getPostById(id),
            new NotFoundException( POST_ERRORS.NOT_FOUND() )
        )

        if (post.authorId !== author.id) throw new ForbiddenException( POST_ERRORS.FORBIDDEN(CrudEnums.UPDATE) );

        Object.assign(post, updatePostDto);

        return this.postRepository.save(post);
    }

    async deletePost(id: number, author: any): Promise<void> {

        const post = ensureExists(
            await this.getPostById(id),
            new NotFoundException(POST_ERRORS.NOT_FOUND())
        )

        const isOwner = post.authorId === author.id;
        const hasPrivileges = [RolsEnum.ADMIN, RolsEnum.MODERATOR].some(role => author.roles.include(role));

        if (!isOwner && !hasPrivileges) throw new ForbiddenException( POST_ERRORS.FORBIDDEN(CrudEnums.DELETE) );
        
        await this.postRepository.remove(post);
    }
}
