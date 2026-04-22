import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';

import { UserEntity } from 'src/modules/users/entities/users.entity';
import { Post } from 'src/modules/post/entities/post.entity';

@Entity('Reactions')
@Unique('unique_user_post_reaction', ['author', 'post']) // Un Solo Like por Autor y Post
export class ReactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  author: UserEntity;

  @ManyToOne(() => Post, (post) => post.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}