import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { FriendshipStatus } from 'src/common/enums/friend.enum';
import { UserEntity } from 'src/modules/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('friendship')
export class FriendshipEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  @ApiHideProperty()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'enum', enum: FriendshipStatus, default: FriendshipStatus.PENDING })
  status: FriendshipStatus;

  @ManyToOne(() => UserEntity, (user) => user.sentFriendRequest, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.receivedFriendRequest, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'friendId' })
  friend: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
