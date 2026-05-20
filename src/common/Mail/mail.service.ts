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

  async sendPostEliminadoEmail(to: string, username: string, postTitle: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Tu publicación fue eliminada',
        template: 'post-eliminado',
        context: {
          name: username,
          postTitle,
        },
      });
      this.logger.log(`Post eliminado email sent to: ${to}`);
    } catch (error) {
      this.logger.error('Failed to send post eliminado email', error as Error);
      throw new ServiceUnavailableException('No se pudo enviar la notificación de eliminación.');
    }
}

  async sendCommentEliminadoEmail(to: string, username: string, commentContent: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Tu comentario fue eliminado',
        template: 'comment-eliminado',
        context: {
          name: username,
          commentContent,
        },
      });
      this.logger.log(`Comment eliminado email sent to: ${to}`);
    } catch (error) {
      this.logger.error('Failed to send comment eliminado email', error as Error);
      throw new ServiceUnavailableException('No se pudo enviar la notificación de eliminación.');
    }
  }
}