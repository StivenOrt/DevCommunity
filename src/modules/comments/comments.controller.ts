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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolsGuard } from '../auth/guards/rols.guard';
import { AutorGuard } from '../auth/guards/author.guard';
import { Autor } from '../auth/decorators/authors.decorator';
import { CommentsEntity } from './entities/comments.entity';

@UseGuards(JwtAuthGuard, RolsGuard)
@ApiTags('comments')
@ApiBearerAuth() 
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@GetUser() user, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(user, dto);
  }
 
  @UseGuards(AutorGuard)
  @Autor(CommentsEntity)
  @Get('post/:postId')
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.findByPost(postId);
  }

  @UseGuards(AutorGuard)
  @Autor(CommentsEntity)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(user, id, dto);
  }

  @UseGuards(AutorGuard)
  @Autor(CommentsEntity)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user,
  ) {
    return this.commentsService.remove(user, id);
  }
}