import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostEntity } from './entities/post.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}


  @ApiOperation({ summary: 'Postea una nueva publicación' })
  @ApiResponse({ status: 200, description: 'Devuelve el contenido de la publicación creada' })
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.postService.createPost(createPostDto);
  }


  @ApiOperation({ summary: 'Obtiene la lista de todas las publicaciónes' })
  @Get()
  async getAllPosts(): Promise<PostEntity[]> {
    return this.postService.getAllPosts();
  }


  @Get(':id')
  async getPostById(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postService.getPostById(id);
  }


  @Put(':id')
  async updatePost( @Param('id', ParseIntPipe) id: number, @Body() updatePostDto: CreatePostDto, @GetUser() user ): Promise<PostEntity> {
    return this.postService.updatePost(id, updatePostDto, user);
  }
  

  @Delete(':id')
  async deletePost(@Param('id', ParseIntPipe) id: number, @GetUser() user ): Promise<void> {
    return this.postService.deletePost(id, user);
  }


}