import { Exclude } from "class-transformer";
import { RolsEntity } from "../../rols/entities/rols.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "src/modules/post/entities/post.entity";
import { Comment } from "src/modules/comments/entities/comments.entity";
import { ReactionEntity} from "src/modules/reactions/entities/reactions.entity";


@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    @Exclude({ toPlainOnly: true })
    password: string;

    @Column()
    roleId: string;

    @ManyToOne(() => RolsEntity, role => role.users)
    @JoinColumn({ name: 'roleId' })
    role: RolsEntity;

    @OneToMany(() => Post, (post) => post.author)
    posts: Post[];

    @OneToMany(() => Comment, (comment) => comment.author)
    comments: Comment[];

    @OneToMany(() => ReactionEntity, (reaction) => reaction.author)
    reactions: ReactionEntity[];
}