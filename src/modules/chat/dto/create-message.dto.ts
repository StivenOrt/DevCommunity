import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateMessageDto {

    @ApiProperty({
        example: 'Hola'
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        example: '123'
    })
    @IsString()
    @IsNotEmpty()
    chatUuid: string;

    @ApiProperty({
        example: '123'
    })
    @IsString()
    @IsNotEmpty()
    senderUuid: string;

}