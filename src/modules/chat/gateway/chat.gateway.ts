import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from '../chat.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';

/**
 * Gateway WebSocket para mensajería privada en tiempo real.
 *
 * Eventos del cliente → servidor:
 *  - "send_message"   : enviar mensaje a un amigo
 *  - "join_chat"      : unirse a la sala de una conversación específica
 *
 * Eventos del servidor → cliente:
 *  - "new_message"    : nuevo mensaje recibido
 *  - "error"          : error de negocio (no amigos, bloqueado, etc.)
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  /** Mapa: userId → socketId (para envío directo) */
  private connectedUsers = new Map<number, string>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  // ─── Conexión / Desconexión ───────────────────────────────────────────────

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOneBy.id(payload.sub);

      if (!user) {
        client.disconnect();
        return;
      }

      // Guardar referencia y unir a sala personal (userId)
      (client as any).user = user;
      this.connectedUsers.set(user.id, client.id);
      client.join(`user_${user.id}`);

      console.log(`[Chat WS] Usuario conectado: ${user.username} (socket: ${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = (client as any).user;
    if (user) {
      this.connectedUsers.delete(user.id);
      console.log(`[Chat WS] Usuario desconectado: ${user.username}`);
    }
  }

  // ─── Eventos ──────────────────────────────────────────────────────────────

  /** Cliente envía un mensaje privado */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const sender = (client as any).user;
    if (!sender) return;

    try {
      const message = await this.chatService.sendMessage(sender, dto);

      // Emitir al sender (confirmación)
      client.emit('new_message', message);

      // Emitir al receiver si está conectado (tiempo real)
      this.server.to(`user_${message.receiverId}`).emit('new_message', message);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  /** Cliente se une a la sala de una conversación (para filtrar eventos) */
  @SubscribeMessage('join_chat')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { partnerUuid: string },
  ) {
    const user = (client as any).user;
    if (!user) return;

    const roomName = this.buildRoomName(user.id, data.partnerUuid);
    client.join(roomName);
    client.emit('joined_chat', { room: roomName });
  }

  // ─── Helper ───────────────────────────────────────────────────────────────

  private buildRoomName(userId: number, partnerUuid: string): string {
    // Sala determinista para la pareja de usuarios
    return `chat_${[userId, partnerUuid].sort().join('_')}`;
  }
}
