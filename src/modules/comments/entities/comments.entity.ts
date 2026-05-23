import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Generated,
} from 'typeorm';

import { UserEntity } from 'src/modules/users/entities/users.entity';
import { PostEntity } from 'src/modules/post/entities/post.entity';

@Entity('comments')
export class CommentsEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column()
  authorId: number;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @Column()
  postId: number;

  @ManyToOne(() => PostEntity, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  post: PostEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}