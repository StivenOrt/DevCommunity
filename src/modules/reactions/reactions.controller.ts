import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Get,
} from '@nestjs/common';

import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';

import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('reactions')
@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  @ApiBearerAuth() // 🔥 IMPORTANTE
  @UseGuards(AuthGuard('jwt'))
  addReaction(@GetUser() user, @Body() dto: CreateReactionDto) {
    return this.reactionsService.addReaction(user, dto);
  }

  @Delete(':postId')
  @ApiBearerAuth() // 🔥 IMPORTANTE
  @UseGuards(AuthGuard('jwt'))
  removeReaction(
    @GetUser() user,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.reactionsService.removeReaction(user, postId);
  }

  @Get('count/:postId')
  count(@Param('postId', ParseIntPipe) postId: number) {
    return this.reactionsService.countReactions(postId);
  }
}