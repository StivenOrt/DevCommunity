import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PostCreatedEvent } from '../events/post-created.event';
import { FriendsService } from 'src/modules/friends/friends.service';
import { MailService } from 'src/Mail/mail.service';

@Injectable()
export class PostNotificationListener {

    private readonly logger = new Logger(PostNotificationListener.name);

    constructor(
        private readonly friendsService: FriendsService,
        private readonly mailService: MailService,
    ) {}
    
@OnEvent('post.created')
async handlePostCreated(event: PostCreatedEvent) {

    console.log(event)
    /* ─── obtenemos el post y autor ─── */

    const post = event.post;

    const author = post.author;

    /* ─── obtenemos amigos aceptados ─── */

    console.log(author)
    const friends = await this.friendsService.getMyFriends(author);

    console.log(friends)

    /* ─── eliminamos correos duplicados ─── */

    const uniqueEmails = [...new Set(
        friends.map(friend => friend.email)
    )];

    /* ─── enviamos todos los correos en paralelo ─── */

    await Promise.all(

        uniqueEmails.map(async (email) => {

            try {

                await this.mailService.sendNewPostNotification(
                    email,
                    author.username,
                    post.title,
                    post.content,
                );

            } catch (error) {

                this.logger.error(
                    `Error enviando correo a ${email}`,
                    error,
                );

            }

        })
    );
}
}