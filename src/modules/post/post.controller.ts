import {
  Controller,
  Post as HttpPost,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @HttpPost()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreatePostDto, @GetUser() user) {
    return this.postService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }
}