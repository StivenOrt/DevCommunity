import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendshipEntity } from './entities/friendship.entity';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { UpdateFriendStatusDto } from './dto/update-friend-status.dto';
import { FriendshipStatus } from 'src/common/enums/friend.enum';
import { UserEntity } from '../users/entities/users.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendshipEntity)
    private readonly friendshipRepository: Repository<FriendshipEntity>,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Verifica si dos usuarios tienen amistad mutua aceptada (para el chat). */
  async areMutualFriends(userAId: number, userBId: number): Promise<boolean> {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { user: { id: userAId }, friend: { id: userBId }, status: FriendshipStatus.ACCEPTED },
        { user: { id: userBId }, friend: { id: userAId }, status: FriendshipStatus.ACCEPTED },
      ],
    });
    return !!friendship;
  }

  /** Verifica si el usuario está bloqueado por el otro participante. */
  async isBlocked(senderId: number, receiverId: number): Promise<boolean> {
    const blocked = await this.friendshipRepository.findOne({
      where: [
        { user: { id: receiverId }, friend: { id: senderId }, status: FriendshipStatus.BLOCKED },
      ],
    });
    return !!blocked;
  }

  // ─── Endpoints ────────────────────────────────────────────────────────────

  /**
   * 1. Enviar solicitud de amistad.
   * El usuario autenticado envía la solicitud; el receptor la verá en PENDING.
   */
  async sendFriendRequest(
    currentUser: UserEntity,
    dto: CreateFriendRequestDto,
  ): Promise<FriendshipEntity> {
    if (currentUser.uuid === dto.friendUuid) {
      throw new BadRequestException('No puedes enviarte una solicitud de amistad a ti mismo.');
    }

    // Verificar relación existente en ambas direcciones
    const existing = await this.friendshipRepository.findOne({
      where: [
        { user: { uuid: currentUser.uuid }, friend: { uuid: dto.friendUuid } },
        { user: { uuid: dto.friendUuid }, friend: { uuid: currentUser.uuid } },
      ],
    });

    if (existing) {
      throw new BadRequestException(
        'Ya existe una solicitud o relación de amistad entre estos usuarios.',
      );
    }

    const newRequest = this.friendshipRepository.create({
      user: { uuid: currentUser.uuid } as UserEntity,
      friend: { uuid: dto.friendUuid } as UserEntity,
      status: FriendshipStatus.PENDING,
    });

    return this.friendshipRepository.save(newRequest);
  }

  /**
   * 2. Responder a una solicitud (solo el receptor puede aceptar/rechazar).
   */
  async respondToRequest(
    currentUser: UserEntity,
    requestUuid: string,
    dto: UpdateFriendStatusDto,
  ): Promise<FriendshipEntity> {
    const request = await this.friendshipRepository.findOne({
      where: {
        uuid: requestUuid,
        friend: { id: currentUser.id },
      },
    });

    if (!request) {
      throw new NotFoundException(
        'La solicitud de amistad no existe o no tienes permisos para modificarla.',
      );
    }

    if (request.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException('Esta solicitud ya ha sido respondida.');
    }

    request.status = dto.status;
    return this.friendshipRepository.save(request);
  }

  /**
   * 3. Bloquear a un usuario (también cancela la amistad si existía).
   */
  async blockUser(
    currentUser: UserEntity,
    targetUuid: string,
  ): Promise<FriendshipEntity> {
    if (currentUser.uuid === targetUuid) {
      throw new BadRequestException('No puedes bloquearte a ti mismo.');
    }

    let relationship = await this.friendshipRepository.findOne({
      where: [
        { user: { id: currentUser.id }, friend: { uuid: targetUuid } },
        { user: { uuid: targetUuid }, friend: { id: currentUser.id } },
      ],
    });

    if (relationship) {
      // Si ya existe relación, la actualizamos a BLOCKED desde el bloqueador
      if (relationship.friend?.id === currentUser.id) {
        // El usuario actual era el "friend", re-crear con roles invertidos
        await this.friendshipRepository.remove(relationship);
        relationship = null;
      }
    }

    if (!relationship) {
      relationship = this.friendshipRepository.create({
        user: { id: currentUser.id } as UserEntity,
        friend: { uuid: targetUuid } as UserEntity,
        status: FriendshipStatus.BLOCKED,
      });
    } else {
      relationship.status = FriendshipStatus.BLOCKED;
    }

    return this.friendshipRepository.save(relationship);
  }

  /**
   * 4. Obtener lista de amigos aceptados del usuario autenticado.
   */
  async getMyFriends(currentUser: UserEntity): Promise<UserEntity[]> {
    const friendships = await this.friendshipRepository.find({
      where: [
        { user: { id: currentUser.id }, status: FriendshipStatus.ACCEPTED },
        { friend: { id: currentUser.id }, status: FriendshipStatus.ACCEPTED },
      ],
      relations: ['user', 'friend'],
    });

    // Devolver la contraparte de la relación (no el propio usuario)
    return friendships.map((f) =>
      f.user.id === currentUser.id ? f.friend : f.user,
    );
  }

  /**
   * 5. Obtener solicitudes pendientes recibidas.
   */
  async getPendingRequests(currentUser: UserEntity): Promise<FriendshipEntity[]> {
    return this.friendshipRepository.find({
      where: {
        friend: { id: currentUser.id },
        status: FriendshipStatus.PENDING,
      },
      relations: ['user'],
    });
  }

  /**
   * 6. Cancelar solicitud enviada o eliminar amistad.
   */
  async removeFriendship(
    currentUser: UserEntity,
    requestUuid: string,
  ): Promise<{ message: string }> {
    const relationship = await this.friendshipRepository.findOne({
      where: [
        { uuid: requestUuid, user: { id: currentUser.id } },
        { uuid: requestUuid, friend: { id: currentUser.id } },
      ],
    });

    if (!relationship) {
      throw new NotFoundException('Relación de amistad no encontrada.');
    }

    if (
      relationship.status === FriendshipStatus.BLOCKED &&
      relationship.user?.id !== currentUser.id
    ) {
      throw new ForbiddenException('No tienes permiso para modificar este bloqueo.');
    }

    await this.friendshipRepository.remove(relationship);
    return { message: 'Relación eliminada correctamente.' };
  }
}
