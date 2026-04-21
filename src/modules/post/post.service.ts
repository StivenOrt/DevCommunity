import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';

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

    async updatePost(id: number, updatePostDto: CreatePostDto): Promise<PostEntity> {
        const post = await this.getPostById(id);

        Object.assign(post, updatePostDto);

        return this.postRepository.save(post);
    }

    async deletePost(id: number): Promise<void> {

        const post = await this.getPostById(id);
        
        await this.postRepository.remove(post);
    }
}
