import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { postEliminadoTemplate } from './templates/post-eliminado.template';
import { commentEliminadoTemplate } from './templates/comment-eliminado.template';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.getOrThrow<string>('MAIL_USER'),
        pass: this.configService.getOrThrow<string>('MAIL_PASSWORD'),
      },
    });
  }

  async notificarPostEliminado(
    emailDestino: string,
    username: string,
    postTitle: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"DevCommunity" <${this.configService.getOrThrow('MAIL_USER')}>`,
        to: emailDestino,
        subject: 'Tu publicación fue eliminada',
        html: postEliminadoTemplate(username, postTitle),
      });
      this.logger.log(`Correo enviado a ${emailDestino} por eliminación de post`);
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${emailDestino}`, error);
      throw new InternalServerErrorException('Error al enviar la notificación');
    }
  }

  async notificarCommentEliminado(
    emailDestino: string,
    username: string,
    commentContent: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"DevCommunity" <${this.configService.getOrThrow('MAIL_USER')}>`,
        to: emailDestino,
        subject: 'Tu comentario fue eliminado',
        html: commentEliminadoTemplate(username, commentContent),
      });
      this.logger.log(`Correo enviado a ${emailDestino} por eliminación de comment`);
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${emailDestino}`, error);
      throw new InternalServerErrorException('Error al enviar la notificación');
    }
  }
}