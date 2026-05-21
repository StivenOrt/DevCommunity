import { PostEntity } from '../entities/post.entity';

export class PostCreatedEvent {
  constructor(
    public readonly post: PostEntity,
  ) {}
}