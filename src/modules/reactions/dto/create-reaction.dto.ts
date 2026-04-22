import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReactionDto {
  @IsInt()
  @ApiProperty()
  postId: number;
}