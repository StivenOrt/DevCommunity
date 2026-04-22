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
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolsGuard } from '../auth/guards/rols.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Rols } from '../auth/decorators/rols.decorator';

@UseGuards(JwtAuthGuard, RolsGuard)
@ApiBearerAuth()
@ApiTags('reactions')
@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}
  @Post()
  addReaction(@GetUser() user, @Body() dto: CreateReactionDto) { 
    return this.reactionsService.addReaction(user, dto);
  }

  @Rols('1')
  @Delete(':postId')
  removeReaction(
    @GetUser() user,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.reactionsService.removeReaction(user, postId);
  }

  @Get()
  getAllReactions() {
    return this.reactionsService.getAllReactions();
  }

  @Rols('1')
  @Get('count/:postId')
  count(@Param('postId', ParseIntPipe) postId: number) {
    return this.reactionsService.countReactions(postId);
  }
}