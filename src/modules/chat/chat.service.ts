import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrivateMessageEntity } from './entities/private-message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { GetConversationQueryDto } from './dto/get-conversation-query.dto';

import { UserEntity } from '../users/entities/users.entity';
import { FriendsService } from '../friends/friends.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(PrivateMessageEntity)
    private readonly messageRepository: Repository<PrivateMessageEntity>,

    private readonly friendsService: FriendsService,
  ) {}

  // ─── Validaciones de acceso ───────────────────────────────────────────────

  /**
   * Valida que dos usuarios puedan chatear:
   *  1. Deben tener amistad mutua aceptada.
   *  2. El sender no debe estar bloqueado por el receiver.
   */
  private async validateChatAccess(
    sender: UserEntity,
    receiverId: number,
    receiverUuid?: string,
  ): Promise<void> {
    const areFriends = await this.friendsService.areMutualFriends(sender.id, receiverId);
    if (!areFriends) {
      throw new ForbiddenException(
        'Solo puedes chatear con usuarios que también te sigan mutuamente (amigos).',
      );
    }

    const blocked = await this.friendsService.isBlocked(sender.id, receiverId);
    if (blocked) {
      throw new ForbiddenException(
        'No puedes enviar mensajes a este usuario porque te ha bloqueado.',
      );
    }
  }

  // ─── Enviar mensaje ────────────────────────────────────────────────────────

  /**
   * Envía un mensaje. Reglas HU-03:
   * - Amistad mutua requerida.
   * - No puede enviar si está bloqueado por el receptor.
   */
  async sendMessage(
    sender: UserEntity,
    dto: SendMessageDto,
  ): Promise<PrivateMessageEntity> {
    if (sender.uuid === dto.receiverUuid) {
      throw new BadRequestException('No puedes enviarte mensajes a ti mismo.');
    }

    // Resolver el receiverId desde el uuid
    const receiver = await this.messageRepository.manager.findOne(UserEntity, {
      where: { uuid: dto.receiverUuid },
    });

    if (!receiver) {
      throw new NotFoundException('El usuario destinatario no existe.');
    }

    await this.validateChatAccess(sender, receiver.id);

    const message = this.messageRepository.create({
      content: dto.content,
      senderId: sender.id,
      receiverId: receiver.id,
    });

    return this.messageRepository.save(message);
  }

  // ─── Obtener conversación ─────────────────────────────────────────────────

  /**
   * Devuelve el historial de mensajes entre el usuario autenticado y otro usuario.
   * Solo los participantes pueden ver la conversación (HU-03).
   */
  async getConversation(
    currentUser: UserEntity,
    partnerUuid: string,
    query: GetConversationQueryDto,
  ): Promise<{ data: PrivateMessageEntity[]; total: number; page: number; limit: number }> {
    const partner = await this.messageRepository.manager.findOne(UserEntity, {
      where: { uuid: partnerUuid },
    });

    if (!partner) {
      throw new NotFoundException('El usuario no existe.');
    }

    // Verificar que sean amigos para poder ver la conversación
    const areFriends = await this.friendsService.areMutualFriends(currentUser.id, partner.id);
    if (!areFriends) {
      throw new ForbiddenException(
        'Solo puedes ver conversaciones con tus amigos.',
      );
    }

    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.messageRepository.findAndCount({
      where: [
        { senderId: currentUser.id, receiverId: partner.id },
        { senderId: partner.id, receiverId: currentUser.id },
      ],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    return { data, total, page, limit };
  }

  // ─── Listar chats activos ─────────────────────────────────────────────────

  /**
   * Devuelve la lista de conversaciones del usuario (último mensaje de cada chat).
   */
  async getMyChats(currentUser: UserEntity): Promise<any[]> {
    // Subconsulta: IDs de usuarios con quienes tiene mensajes
    const result = await this.messageRepository
      .createQueryBuilder('msg')
      .select(
        `CASE WHEN msg."senderId" = :uid THEN msg."receiverId" ELSE msg."senderId" END`,
        'partnerId',
      )
      .addSelect('MAX(msg.created_at)', 'lastMessageAt')
      .addSelect('MAX(msg.content)', 'lastContent') // aproximado; usar subquery para exacto
      .where('msg."senderId" = :uid OR msg."receiverId" = :uid', { uid: currentUser.id })
      .groupBy(
        `CASE WHEN msg."senderId" = :uid THEN msg."receiverId" ELSE msg."senderId" END`,
      )
      .setParameter('uid', currentUser.id)
      .orderBy('"lastMessageAt"', 'DESC')
      .getRawMany();

    return result;
  }

  // ─── Marcar mensajes como leídos ──────────────────────────────────────────

  /**
   * Marca como leídos todos los mensajes enviados por `senderUuid` al usuario actual.
   */
  async markAsRead(
    currentUser: UserEntity,
    senderUuid: string,
  ): Promise<{ updated: number }> {
    const sender = await this.messageRepository.manager.findOne(UserEntity, {
      where: { uuid: senderUuid },
    });

    if (!sender) throw new NotFoundException('El usuario no existe.');

    const result = await this.messageRepository.update(
      { senderId: sender.id, receiverId: currentUser.id, isRead: false },
      { isRead: true },
    );

    return { updated: result.affected ?? 0 };
  }
}
