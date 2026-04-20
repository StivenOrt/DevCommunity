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

@Entity('reactions')
@Unique(['user', 'post']) // 🔥 REGLA DEL DOCUMENTO
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => Post, (post) => post.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}