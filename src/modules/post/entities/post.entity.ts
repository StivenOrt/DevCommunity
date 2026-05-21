import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Generated } from 'typeorm';
import { UserEntity } from 'src/modules/users/entities/users.entity';
import { CommentsEntity } from 'src/modules/comments/entities/comments.entity';
import { ReactionEntity } from 'src/modules/reactions/entities/reactions.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity('posts')
export class PostEntity {

  @Exclude()
  @ApiHideProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  @JoinColumn({ name: 'author' })
  author: UserEntity;

  @OneToMany(() => CommentsEntity, (comment) => comment.post)
  comments: CommentsEntity[];

  @OneToMany(() => ReactionEntity, (reaction) => reaction.post, {
    cascade: true,
  })
  reactions: ReactionEntity[];
}