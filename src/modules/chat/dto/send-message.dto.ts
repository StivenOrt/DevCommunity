import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'UUID del usuario destinatario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  receiverUuid: string;

  @ApiProperty({
    description: 'Contenido del mensaje',
    example: '¡Hola! ¿Cómo estás?',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'El mensaje no puede superar los 2000 caracteres.' })
  content: string;
}
