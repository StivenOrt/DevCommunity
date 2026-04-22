import { IsEmail, IsString, MinLength, IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty()
    @IsEmail({}, { message: "Correo electrónico inválido" })
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    
    password: string;
}