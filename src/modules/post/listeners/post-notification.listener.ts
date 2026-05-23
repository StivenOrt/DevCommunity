import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PostCreatedEvent } from '../events/post-created.event';
import { FriendsService } from 'src/modules/friends/friends.service';
import { MailService } from 'src/common/Mail/mail.service';

@Injectable()
export class PostNotificationListener {

  private readonly logger = new Logger(PostNotificationListener.name);

  constructor(
    private readonly friendsService: FriendsService,
    private readonly mailService: MailService,
  ) {}

  @OnEvent('post.created')
  async handlePostCreated(event: PostCreatedEvent) {
    const post = event.post;
    const author = post.author;

    const friends = await this.friendsService.getMyFriends(author);

    const uniqueEmails = [...new Set(
      friends.map(friend => friend.email)
    )];

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
          this.logger.error(`Error enviando correo a ${email}`, error);
        }
      })
    );
  }
}