import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    const rawHost = this.config.get<string>('SMTP_HOST') || '127.0.0.1';
    const host = rawHost === 'localhost' ? '127.0.0.1' : rawHost;
    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendVerificationEmail(to: string, code: string) {
    const from = this.config.get<string>('SMTP_FROM') || this.config.get<string>('SMTP_USER');

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: 'Código de verificación',
        text: `Tu código de verificación es: ${code}. Si no solicitaste este código, ignora este correo.`,
        html: `<p>Tu código de verificación es: <strong>${code}</strong></p><p>Si no solicitaste este código, ignora este correo.</p>`,
      });

      this.logger.log(`Verification email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('SMTP connection failed while sending verification code', error as Error);
      throw new ServiceUnavailableException('No se pudo enviar el codigo de verificacion. Verifica la configuracion SMTP.');
    }
  }
}
