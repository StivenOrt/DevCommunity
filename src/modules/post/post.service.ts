import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { RolsEnum } from 'src/common/enums/rols.enums';

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
        return this.postRepository.find();
    }

    async getPostById(id: number): Promise<PostEntity> {

        const post = await this.postRepository.findOneBy({ id });

        if (!post) throw new NotFoundException(`Post with ID ${id} not found`);
        
        return post;
    }

    async updatePost(id: number, updatePostDto: CreatePostDto, user: any): Promise<PostEntity> {
        const post = await this.getPostById(id);
        if (!post) throw new NotFoundException();

        if (post.authorId !== user.id) throw new ForbiddenException('No tienes permiso para editar este POST');

        Object.assign(post, updatePostDto);

        return this.postRepository.save(post);
    }

    async deletePost(id: number, user: any): Promise<void> {

        const post = await this.getPostById(id);
        if (!post) throw new NotFoundException();

        const isOwner = post.authorId === user.id;
        const hasPrivileges = [RolsEnum.ADMIN, RolsEnum.MODERATOR].some(role => user.roles.include(role));

        if (!isOwner && !hasPrivileges) throw new ForbiddenException('No tienes permiso para eliminar este POST');
        
        await this.postRepository.remove(post);
    }
}
