import { Exclude } from "class-transformer";
import { RolesEntity } from "../../roles/entities/roles.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Generated, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PostEntity } from "src/modules/post/entities/post.entity";
import { CommentsEntity } from "src/modules/comments/entities/comments.entity";
import { ReactionEntity } from "src/modules/reactions/entities/reactions.entity";
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";

@Entity('users')
export class UserEntity {

    @ApiHideProperty()
    @Exclude()
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @ApiProperty({
        description: 'El nombre de usuario',
        example: 'Pedro',
    })
    @Column({ type: 'varchar', length: 15, unique: true })
    username: string;

    @ApiProperty({
        description: 'El correo asociado al usuario',
        example: 'pedro@gmail.com'
    })
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ name: 'password_hash', type: 'varchar', length: 255 })
    @Exclude({ toPlainOnly: true })
    passwordHash: string;

    @ManyToOne( () => RolesEntity, role => role.users )
    @JoinColumn({ name: 'role' })
    role: RolesEntity;

    @OneToMany( () => PostEntity, (post) => post.author )
    posts: PostEntity[];

    @OneToMany( () => CommentsEntity, (comment) => comment.author )
    comments: CommentsEntity[];

    @OneToMany( () => ReactionEntity, (reaction) => reaction.author )
    reactions: ReactionEntity[];

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
    deletedAt: Date;
}