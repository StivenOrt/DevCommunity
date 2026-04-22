import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from 'src/modules/users/entities/users.entity';
import { PostEntity } from 'src/modules/post/entities/post.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column()
  authorId: number;

  @Column()
  postId: number;

  @ManyToOne(() => UserEntity, (user) => user.comments)
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.comments)
  @JoinColumn({ name: 'postId' })
  post: PostEntity;
}