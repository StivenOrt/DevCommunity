import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GetConversationQueryDto } from './dto/get-conversation-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserEntity } from '../users/entities/users.entity';
import { CreateChatDto } from './dto/create-chat.dto';

@ApiTags('Chat Privado')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getAll() {
    return this.chatService.getAll()
  }

  @Post()
  async create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto)
  }

}
