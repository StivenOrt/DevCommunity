import { IsInt } from 'class-validator';

export class CreateReactionDto {
  @IsInt()
  postId: number;
}