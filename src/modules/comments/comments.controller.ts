import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@GetUser() user, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(user, dto);
  }

  @Get('post/:postId')
  findByPost(@Param('postId') postId: number) {
    return this.commentsService.findByPost(postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: number,
    @GetUser() user,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, user, dto.content);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: number, @GetUser() user) {
    return this.commentsService.remove(id, user);
  }
}