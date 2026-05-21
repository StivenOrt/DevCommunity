import { ApiHideProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { UserEntity } from "src/modules/users/entities/users.entity";
import { Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MessageEntity } from "./message.entity";


@Entity('chats')
export class ChatEntity {

    @ApiHideProperty()
    @Exclude()
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @ManyToOne( () => UserEntity, (user) => user.sender)
    @JoinColumn({ name: 'sender' })
    sender: UserEntity;

    @ManyToOne( () => UserEntity, (user) => user.receiver)
    @JoinColumn({ name: 'receiver' })
    receiver: UserEntity;

    @OneToMany( () => MessageEntity, (message) => message.chat)
    messages: MessageEntity[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

}
