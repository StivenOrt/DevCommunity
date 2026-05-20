import { IsNotEmpty, IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {

  @ApiProperty({
    example: 'Me gusta el contenido de tu post'
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsString()
  postUuid: string;
  
}