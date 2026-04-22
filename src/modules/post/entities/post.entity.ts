import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from 'src/modules/users/entities/users.entity';
import { CommentsEntity } from 'src/modules/comments/entities/comments.entity';
import { ReactionEntity } from 'src/modules/reactions/entities/reactions.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column()
  authorId: number;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @OneToMany(() => CommentsEntity, (comment) => comment.post)
  comments: CommentsEntity[];

  @OneToMany(() => ReactionEntity, (reaction) => reaction.post, {
    cascade: true,
  })
  reactions: ReactionEntity[];
}