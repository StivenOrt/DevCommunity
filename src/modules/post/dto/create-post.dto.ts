import { IsNotEmpty, IsString } from "class-validator";
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
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'El ID del autor creador de la publicación'
    })
    @IsString()
    @IsNotEmpty()
    authorUuid: String;
}