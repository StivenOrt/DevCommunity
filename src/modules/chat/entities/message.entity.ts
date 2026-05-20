import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Generated, JoinColumn, CreateDateColumn } from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { ChatEntity } from './chat.entity';
import { UserEntity } from 'src/modules/users/entities/users.entity';

@Entity('messages')
export class MessageEntity {

  @ApiHideProperty()
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ name: 'content' })
  content: string;

  @ManyToOne( () => ChatEntity, (chat) => chat.messages)
  @JoinColumn()
  chat: ChatEntity;

  @ManyToOne( () => UserEntity )
  sender: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
