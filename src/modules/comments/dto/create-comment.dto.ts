import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  content: string;

  @IsInt()
  postId: number;
}