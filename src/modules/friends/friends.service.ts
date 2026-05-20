import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendshipEntity } from './entities/friendship.entity';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { UpdateFriendStatusDto } from './dto/update-friend-status.dto';
import { FriendshipStatus } from 'src/common/enums/friend.enum';
import { UserEntity } from '../users/entities/users.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendshipEntity)
    private readonly friendshipRepository: Repository<FriendshipEntity>,
    
    private readonly userRepository: UsersService
  ) {}


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

  async sendFriendRequest( currentUser: UserEntity, dto: CreateFriendRequestDto ): Promise<{ message: string }> {

    const { friendUuid } = dto;

    const newFriendshipData: Partial<FriendshipEntity> = {}


    if (currentUser.uuid === friendUuid) throw new BadRequestException('No puedes enviarte una solicitud de amistad a ti mismo.');
    
    const friendUser = await this.userRepository.findOneBy.uuid(friendUuid);
    const user = await this.userRepository.findOneBy.uuid(currentUser.uuid)

    const existing = await this.friendshipRepository.findOne({
      where: [
        { user: { uuid: currentUser.uuid }, friend: { uuid: friendUser.uuid } },
        { user: { uuid: friendUser.uuid }, friend: { uuid: currentUser.uuid } },
      ],
    });

    if (existing) throw new BadRequestException( 'Ya existe una solicitud o relación de amistad entre estos usuarios' );

    newFriendshipData.user = user;
    newFriendshipData.friend = friendUser

    const newFriendship = this.friendshipRepository.create(newFriendshipData)

    await this.friendshipRepository.save(newFriendship)

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

  async blockUser( currentUser: UserEntity, targetUuid: string ) {

    if (currentUser.uuid === targetUuid) throw new BadRequestException('No puedes bloquearte a ti mismo');

    const targetUser: UserEntity = await this.userRepository.findOneBy.uuid(targetUuid);
    const user: UserEntity = await this.userRepository.findOneBy.uuid(currentUser.uuid);

    const friendShip = await this.friendshipRepository.findOne({
      where: [
        { user: { uuid: user.uuid }, friend: { uuid: targetUser.uuid } },
        { user: { uuid: targetUser.uuid }, friend: { uuid: user.uuid } },
      ],
    });

    let data: FriendshipEntity

    if (friendShip) {

      if (friendShip.status === FriendshipStatus.BLOCKED) throw new ConflictException( 'Ese usuario ya esta bloqueado' )
      const editFriendship = this.friendshipRepository.merge(friendShip, { status: FriendshipStatus.BLOCKED })
      data = await this.friendshipRepository.save(editFriendship)

    } else {
      const newFriendship = this.friendshipRepository.create({
        friend: targetUser,
        user,
        status: FriendshipStatus.BLOCKED
      })

      data = await this.friendshipRepository.save(newFriendship)
    }

    return { 
      data,
      message: 'Usuario bloqueado correctamente'
    };
  }

  // ─── 4. Listar amigos aceptados ───────────────────────────────────────────

  async getMyFriends(currentUser: UserEntity): Promise<UserEntity[]> {

    const friendships = await this.friendshipRepository.find({
      where: [
        { user: { uuid: currentUser.uuid }, status: FriendshipStatus.ACCEPTED },
        { friend: { uuid: currentUser.uuid }, status: FriendshipStatus.ACCEPTED },
      ],
      relations: ['user', 'friend'],
    });

    return friendships.map((f) =>
      f.user.uuid === currentUser.uuid ? f.friend : f.user,
    );
  }

  async getMyBlocks(currentUser: UserEntity): Promise<UserEntity[]> {

    const friendships = await this.friendshipRepository.find({
      where: [
        { user: { uuid: currentUser.uuid }, status: FriendshipStatus.BLOCKED },
        { friend: { uuid: currentUser.uuid }, status: FriendshipStatus.BLOCKED },
      ],
      relations: ['user', 'friend'],
    });

    return friendships.map((f) =>
      f.user.uuid === currentUser.uuid ? f.friend : f.user,
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

  async removeFriendship(currentUser: UserEntity,requestUuid: string ): Promise<{ message: string }> {

    const relationship = await this.friendshipRepository.findOne({
      where: [
        { uuid: requestUuid, user: { uuid: currentUser.uuid } },
        { uuid: requestUuid, friend: { uuid: currentUser.uuid } },
      ],
    });

    if (!relationship) throw new NotFoundException('Relación de amistad no encontrada');

    if (relationship.status === FriendshipStatus.BLOCKED) {

      const isBlocker = await this.friendshipRepository.findOne({
        where: { uuid: requestUuid, user: { uuid: currentUser.uuid } },
      });

      if (!isBlocker) throw new ForbiddenException('No tienes permiso para eliminar este bloqueo');
    }


    await this.friendshipRepository.remove(relationship)

    return { message: 'Relación eliminada correctamente' };
  }
}