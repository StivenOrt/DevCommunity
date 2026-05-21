import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateFriendRequestDto {
  @ApiProperty({
    description: 'UUID del usuario al que se le envía la solicitud de amistad',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  friendUuid: string;
}
