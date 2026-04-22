import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" })
    @MaxLength(20, { message: "El nombre de usuario debe tener menos de 20 caracteres" })
    username: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail({}, { message: "Correo electrónico inválido" })
    email: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    @MaxLength(32, { message: "La contraseña debe tener menos de 32 caracteres" })
    password: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    roleId?: string;
}