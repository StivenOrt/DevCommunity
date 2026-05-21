import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UpdatePostDto extends PartialType(CreatePostDto) {

    @ApiHideProperty()
    @Exclude()
    authorUuid?: string | undefined;
}
