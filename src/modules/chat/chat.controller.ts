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

@ApiTags('Chat Privado')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ── POST /chat/send ────────────────────────────────────────────────────────
  @Post('send')
  @ApiOperation({ summary: 'Enviar un mensaje privado a un amigo' })
  @ApiResponse({ status: 201, description: 'Mensaje enviado.' })
  @ApiResponse({ status: 403, description: 'No son amigos mutuos o el usuario está bloqueado.' })
  @ApiResponse({ status: 404, description: 'Destinatario no encontrado.' })
  sendMessage(
    @GetUser() currentUser: UserEntity,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(currentUser, dto);
  }

  // ── GET /chat ──────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Listar todos los chats activos del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de conversaciones (último mensaje de cada una).' })
  getMyChats(@GetUser() currentUser: UserEntity) {
    return this.chatService.getMyChats(currentUser);
  }

  // ── GET /chat/:partnerUuid ─────────────────────────────────────────────────
  @Get(':partnerUuid')
  @ApiOperation({ summary: 'Obtener el historial de mensajes con un amigo' })
  @ApiParam({ name: 'partnerUuid', description: 'UUID del otro participante del chat' })
  @ApiResponse({ status: 200, description: 'Historial de mensajes paginado.' })
  @ApiResponse({ status: 403, description: 'No eres amigo de este usuario.' })
  getConversation(
    @GetUser() currentUser: UserEntity,
    @Param('partnerUuid') partnerUuid: string,
    @Query() query: GetConversationQueryDto,
  ) {
    return this.chatService.getConversation(currentUser, partnerUuid, query);
  }

  // ── PATCH /chat/:senderUuid/read ───────────────────────────────────────────
  @Patch(':senderUuid/read')
  @ApiOperation({ summary: 'Marcar como leídos los mensajes de un usuario' })
  @ApiParam({ name: 'senderUuid', description: 'UUID del remitente cuyos mensajes se marcarán como leídos' })
  @ApiResponse({ status: 200, description: 'Mensajes marcados como leídos.' })
  markAsRead(
    @GetUser() currentUser: UserEntity,
    @Param('senderUuid') senderUuid: string,
  ) {
    return this.chatService.markAsRead(currentUser, senderUuid);
  }
}
