import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ← cambiado
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiBearerAuth() // provisional
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard) 
  @Post()
  create(@GetUser() user, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(user, dto);
  }

  @Get('post/:postId')
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.findByPost(postId);
  }

  @UseGuards(JwtAuthGuard) // ← cambiado
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(user, id, dto);
  }

  @UseGuards(JwtAuthGuard) // ← cambiado
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user,
  ) {
    return this.commentsService.remove(user, id);
  }
}