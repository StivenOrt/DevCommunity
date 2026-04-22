import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePostDto {
    @ApiProperty({
        example: 'Titulo',
        description: 'El titulo de la publicación'
    })
    @IsString()
    @IsNotEmpty()
    title!: string;

    @ApiProperty({
        example: 'Contenido',
        description: 'El contenido/cuerpo de la publicación'
    })
    @IsString()
    @IsNotEmpty()
    content!: string;

    @ApiProperty({
        example: 1,
        description: 'El ID del autor creador de la publicación'
    })
    @IsNumber()
    @IsNotEmpty()
    authorId!: number;
}