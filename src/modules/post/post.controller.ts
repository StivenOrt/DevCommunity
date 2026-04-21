import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostEntity } from './entities/post.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}


  @Post()
  async createPost(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.postService.createPost(createPostDto);
  }


  @Get()
  async getAllPosts(): Promise<PostEntity[]> {
    return this.postService.getAllPosts();
  }


  @Get(':id')
  async getPostById(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postService.getPostById(id);
  }


  @Put(':id')
  async updatePost( @Param('id', ParseIntPipe) id: number, @Body() updatePostDto: CreatePostDto ): Promise<PostEntity> {
    return this.postService.updatePost(id, updatePostDto);
  }
  

  @Delete(':id')
  async deletePost(@Param('id', ParseIntPipe) id: number ): Promise<void> {
    return this.postService.deletePost(id);
  }


}