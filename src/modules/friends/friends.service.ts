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
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  // ─── Helper: buscar usuario por uuid ──────────────────────────────────────

  private async findUserByUuid(uuid: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { uuid } });
    if (!user) throw new NotFoundException(`Usuario con uuid ${uuid} no encontrado.`);
    return user;
  }

  // ─── Helpers para ChatModule ───────────────────────────────────────────────

  async areMutualFriends(userAId: number, userBId: number): Promise<boolean> {
    const count = await this.friendshipRepository.count({
      where: [
        { user: { id: userAId }, friend: { id: userBId }, status: FriendshipStatus.ACCEPTED },
        { user: { id: userBId }, friend: { id: userAId }, status: FriendshipStatus.ACCEPTED },
      ],
    });
    return count > 0;
  }

  async isBlocked(senderId: number, receiverId: number): Promise<boolean> {
    const count = await this.friendshipRepository.count({
      where: {
        user: { id: receiverId },
        friend: { id: senderId },
        status: FriendshipStatus.BLOCKED,
      },
    });
    return count > 0;
  }

  // ─── 1. Enviar solicitud ───────────────────────────────────────────────────

  async sendFriendRequest(
    currentUser: UserEntity,
    dto: CreateFriendRequestDto,
  ): Promise<{ message: string }> {
    if (currentUser.uuid === dto.friendUuid) {
      throw new BadRequestException('No puedes enviarte una solicitud de amistad a ti mismo.');
    }

    // Resolver el usuario destino para obtener su ID numérico
    const friendUser = await this.findUserByUuid(dto.friendUuid);

    const existing = await this.friendshipRepository.findOne({
      where: [
        { user: { id: currentUser.id }, friend: { id: friendUser.id } },
        { user: { id: friendUser.id }, friend: { id: currentUser.id } },
      ],
    });

    if (existing) {
      throw new BadRequestException(
        'Ya existe una solicitud o relación de amistad entre estos usuarios.',
      );
    }

    // Insertar con IDs numéricos directamente — TypeORM los mapea correctamente a las FKs
    await this.friendshipRepository
      .createQueryBuilder()
      .insert()
      .into(FriendshipEntity)
      .values({
        user: { id: currentUser.id } as UserEntity,
        friend: { id: friendUser.id } as UserEntity,
        status: FriendshipStatus.PENDING,
      })
      .execute();

    return { message: 'Solicitud de amistad enviada correctamente.' };
  }

  // ─── 2. Aceptar / Rechazar ────────────────────────────────────────────────

  async respondToRequest(
    currentUser: UserEntity,
    requestUuid: string,
    dto: UpdateFriendStatusDto,
  ): Promise<{ message: string }> {
    const request = await this.friendshipRepository.findOne({
      where: {
        uuid: requestUuid,
        friend: { id: currentUser.id },
        status: FriendshipStatus.PENDING,
      },
    });

    if (!request) {
      throw new NotFoundException(
        'La solicitud no existe, ya fue respondida, o no tienes permisos.',
      );
    }

    await this.friendshipRepository
      .createQueryBuilder()
      .update(FriendshipEntity)
      .set({ status: dto.status })
      .where('id = :id', { id: request.id })
      .execute();

    return {
      message: `Solicitud ${dto.status === FriendshipStatus.ACCEPTED ? 'aceptada' : 'rechazada'} correctamente.`,
    };
  }

  // ─── 3. Bloquear ──────────────────────────────────────────────────────────

  async blockUser(
    currentUser: UserEntity,
    targetUuid: string,
  ): Promise<{ message: string }> {
    if (currentUser.uuid === targetUuid) {
      throw new BadRequestException('No puedes bloquearte a ti mismo.');
    }

    const targetUser = await this.findUserByUuid(targetUuid);

    const existing = await this.friendshipRepository.findOne({
      where: [
        { user: { id: currentUser.id }, friend: { id: targetUser.id } },
        { user: { id: targetUser.id }, friend: { id: currentUser.id } },
      ],
    });

    if (existing) {
      await this.friendshipRepository
        .createQueryBuilder()
        .update(FriendshipEntity)
        .set({ status: FriendshipStatus.BLOCKED })
        .where('id = :id', { id: existing.id })
        .execute();
    } else {
      await this.friendshipRepository
        .createQueryBuilder()
        .insert()
        .into(FriendshipEntity)
        .values({
          user: { id: currentUser.id } as UserEntity,
          friend: { id: targetUser.id } as UserEntity,
          status: FriendshipStatus.BLOCKED,
        })
        .execute();
    }

    return { message: 'Usuario bloqueado correctamente.' };
  }

  // ─── 4. Listar amigos aceptados ───────────────────────────────────────────

  async getMyFriends(currentUser: UserEntity): Promise<UserEntity[]> {
    const friendships = await this.friendshipRepository.find({
      where: [
        { user: { id: currentUser.id }, status: FriendshipStatus.ACCEPTED },
        { friend: { id: currentUser.id }, status: FriendshipStatus.ACCEPTED },
      ],
      relations: ['user', 'friend'],
    });

    return friendships.map((f) =>
      f.user.id === currentUser.id ? f.friend : f.user,
    );
  }

  // ─── 5. Solicitudes pendientes recibidas ──────────────────────────────────

  async getPendingRequests(currentUser: UserEntity): Promise<FriendshipEntity[]> {
    return this.friendshipRepository.find({
      where: {
        friend: { id: currentUser.id },
        status: FriendshipStatus.PENDING,
      },
      relations: ['user'],
    });
  }

  // ─── 6. Eliminar amistad / cancelar solicitud ─────────────────────────────

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

    if (relationship.status === FriendshipStatus.BLOCKED) {
      const isBlocker = await this.friendshipRepository.findOne({
        where: { uuid: requestUuid, user: { id: currentUser.id } },
      });
      if (!isBlocker) {
        throw new ForbiddenException('No tienes permiso para eliminar este bloqueo.');
      }
    }

    await this.friendshipRepository
      .createQueryBuilder()
      .delete()
      .from(FriendshipEntity)
      .where('id = :id', { id: relationship.id })
      .execute();

    return { message: 'Relación eliminada correctamente.' };
  }
}