import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ensureExists } from 'src/common/utils/assertion.util';
import { POST_ERRORS } from 'src/common/constants/error-messages';
import { UsersService } from '../users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostCreatedEvent } from './events/post-created.event';
import { NotificationsService } from '../notifications/notifications.service';


@Injectable()
export class PostService {
    constructor(
        @InjectRepository(PostEntity)
            private readonly postRepository: Repository<PostEntity>,

        private readonly userRepository: UsersService,
        private readonly notificationsService: NotificationsService,
        private readonly eventEmitter: EventEmitter2

    ) {}

    // --- MÉTODOS DE ESCRITURA Y ACCIONES ---

    async createPost(createPostDto: CreatePostDto): Promise<PostEntity> {
        const { authorUuid, ...newData } = createPostDto;

        const newPostData: Partial<PostEntity> = { ...newData };

        // 💡 Detalle: Recuerda corregir findOneBy.uuid si no cambiaste UsersService a findOneBy({ uuid: ... })
        newPostData.author = await this.userRepository.findOneBy.uuid(authorUuid);

        const newPost = this.postRepository.create(newPostData);
        const savedPost = await this.postRepository.save(newPost);
        
        console.log(savedPost)
        
        // Disparar evento del sistema
        this.eventEmitter.emit('post.created', new PostCreatedEvent(savedPost));

        return savedPost;
    }

    async updatePost(uuid: string, updatePostDto: UpdatePostDto): Promise<PostEntity> {
        const { authorUuid, ...newData } = updatePostDto;

        const postData: Partial<PostEntity> = { ...newData }

        const post = await this.getOneBy.uuid(uuid)

        const updatePost = this.postRepository.merge(post, postData)

        return this.postRepository.save(updatePost);
    }



    async deletePost(uuid: string, idRolUsuario?: string): Promise<void> {
        // Traemos el post con su relación de autor para poder enviarle una notificación si aplica
        const post = await this.postRepository.findOne({
            where: { uuid },
            relations: ['author'],
        });

        if (!post) throw new NotFoundException(POST_ERRORS.NOT_FOUND());

        // Si quien borra el post tiene rol '1' o '2' (admin/moderador), se le notifica al autor
        const esModeradorOAdmin = ['1', '2'].includes(idRolUsuario!);
        if (esModeradorOAdmin && post.author) {
            await this.notificationsService.notificarPostEliminado(
                post.author.email,
                post.author.username,
                post.title,
            );
        }

        await this.postRepository.remove(post);
    }

    // --- MÉTODOS DE CONSULTA Y BÚSQUEDA ---

    async getAllPosts(): Promise<PostEntity[]> {
        return ensureExists(
            await this.postRepository.find(),
            new NotFoundException(POST_ERRORS.NOT_FOUND()),
        );
    }

    // Encapsulado limpio de búsquedas individuales personalizadas
    getOneBy = {
        id: async (id: number): Promise<PostEntity> => {
            return ensureExists(
                await this.postRepository.findOneBy({ id }),
                new NotFoundException(POST_ERRORS.NOT_FOUND())
            );
        },

        uuid: async (uuid: string): Promise<PostEntity> => {
            return ensureExists(
                await this.postRepository.findOne({
                    where: { uuid },
                    relations: ['author'] // Conveniente añadirlo aquí si necesitas leer datos del autor con frecuencia
                }),
                new NotFoundException(POST_ERRORS.NOT_FOUND())
            );
        }
    };
}