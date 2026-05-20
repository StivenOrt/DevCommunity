import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
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

  @Get('post/:postUuid')
  findByPost(
    @Param('postUuid') postUuid: string,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.commentsService.findByPost(postUuid, page);
  }

  @UseGuards(AutorGuard)
  @Autor(CommentsEntity)
  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @GetUser() user,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(user, uuid, dto);
  }

  @UseGuards(AutorGuard)
  @Autor(CommentsEntity)
  @Delete(':uuid')
  remove(
    @Param('uuid') uuid: string,
    @GetUser() user,
  ) {
    return this.commentsService.remove(user, uuid);
  }
}