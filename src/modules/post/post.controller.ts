import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Patch, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostEntity } from './entities/post.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Getauthor } from '../auth/decorators/get-author.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Rols } from '../auth/decorators/rols.decorator';
import { RolsGuard } from '../auth/guards/rols.guard';
import { crearAutorGuard } from '../auth/guards/author.guard';
const PostAutorGuard = crearAutorGuard(PostEntity);
@UseGuards(JwtAuthGuard, RolsGuard)
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

  @ApiOperation({ summary: 'Obtiene la lista de todas las publicaciones' })
  @ApiResponse({ status: 200, description: 'Devuelve la lista de todas las publicaciones activas' })
  @ApiResponse({ status: 404, description: 'Retorna un mensaje de error debido a no haber publicaciones activas' })
  @Get()
  async getAllPosts(): Promise<PostEntity[]> {
    return this.postService.getAllPosts();
  }

  @ApiOperation({ summary: 'Obtiene una publicación por su id' })
  @ApiResponse({ status: 200, description: 'Devuelve la publicación activa' })
  @ApiResponse({ status: 404, description: 'Retorna un mensaje de error debido a no existis esa publicacion' })
  @Get(':id')
  async getPostById(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postService.getPostById(id);
  }

  @ApiOperation({ summary: 'Actualiza una publicación' })
  @ApiResponse({ status: 200, description: 'Devuelve el nuevo objeto de la publicacion' })
  @ApiResponse({ status: 404, description: 'Recurso no hallado con dicho id' })
  @ApiResponse({ status: 403, description: 'Se requiere un rol con el permiso requerido para actualizar' })
  @UseGuards(PostAutorGuard)
  @Rols('1')
  @Patch(':id')
  async updatePost( @Param('id', ParseIntPipe) id: number, @Body() updatePostDto: CreatePostDto, @Getauthor() author ): Promise<PostEntity> {
    return this.postService.updatePost(id, updatePostDto, author);
  }
  
  @ApiOperation({ summary: 'Elimina una publicación' })
  @ApiResponse({ status: 200, description: 'Devuelve un mensaje de confirmación del borrado' })
  @ApiResponse({ status: 404, description: 'Publicación no hallada para eliminar' })
  @ApiResponse({ status: 403, description: 'Se requiere un rol con el permiso de realizar para eliminar' })
  @UseGuards(PostAutorGuard)
  @Rols('1', '2')
  @Delete(':id')
  async deletePost(@Param('id', ParseIntPipe) id: number, @Getauthor() author ): Promise<void> {
    return this.postService.deletePost(id, author);
  }


}