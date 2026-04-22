import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';

import { UserEntity } from 'src/modules/users/entities/users.entity';
import { PostEntity } from 'src/modules/post/entities/post.entity';

@Entity('reactions')
@Unique(['authorId', 'postId'])
export class ReactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  authorId: number;

  @ManyToOne(() => UserEntity, (user) => user.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @Column()
  postId: number;

  @ManyToOne(() => UserEntity, (user) => user.reactions)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.reactions)
  @JoinColumn({ name: 'postId' })
  post: PostEntity;
}