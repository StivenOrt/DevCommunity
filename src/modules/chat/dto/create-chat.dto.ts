import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateChatDto {

    @ApiProperty({
        example: '123'
    })
    @IsString()
    @IsNotEmpty()
    senderUuid: string;
    
    @ApiProperty({
        example: '123'
    })
    @IsString()
    @IsNotEmpty()
    receiverUuid: string;

}