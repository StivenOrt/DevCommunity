import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendLoginVerificationEmail(to: string, code: string, username: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Código de Verificación - Inicio de Sesión',
        template: 'login',
        context: {
          name: username,
          verificationCode: code,
        },
      });
      this.logger.log(`Login verification email sent to: ${to}`);
    } catch (error) {
      this.logger.error('Failed to send login verification email', error as Error);
      throw new ServiceUnavailableException('No se pudo enviar el código de verificación. Verifica la configuración SMTP.');
    }
  }

  async sendPasswordResetEmail(to: string, code: string, username: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Código para Restablecer Contraseña',
        template: 'reset-password',
        context: {
          name: username,
          resetPasswordCode: code,
        },
      });
      this.logger.log(`Password reset email sent to: ${to}`);
    } catch (error) {
      this.logger.error('Failed to send password reset email', error as Error);
      throw new ServiceUnavailableException('No se pudo enviar el código de restablecimiento. Verifica la configuración SMTP.');
    }
  }

  // ─── Notificación de nueva publicación ─────────────────────────────

  async sendNewPostNotification(
    to: string,
    authorName: string,
    title: string,
    content: string,
  ) {

    try {

      await this.mailerService.sendMail({

        // destinatario
        to,

        // asunto del correo
        subject: `${authorName} publicó una nueva publicación`,

        // template handlebars ubicado en templates/new-post.hbs
        template: 'new-post',

        // variables que usará el template
        context: {
          authorName,
          title,

          // preview corto del contenido
          contentPreview: content.slice(0, 100),
        },

      });

      this.logger.log(`New post notification sent to ${to}`);

    } catch (error) {

      this.logger.error(
        'Failed to send new post notification',
        error as Error,
      );

    }
  }
}
