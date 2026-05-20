import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationEntity } from './entities/verification.entity';
import { MailService } from '../../Mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    @InjectRepository(VerificationEntity)
    private readonly verificationRepository: Repository<VerificationEntity>,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findOneBy.email(dto.email);

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.uuid, email: user.email, idRol: user.role.id };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        username: user.username,
        email: user.email,
        role: user.role?.name,
        idRol: user.role.id,
      },
    };
  }

  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async requestLoginCode(dto: LoginDto) {
    const user = await this.usersService.findOneBy.email(dto.email);
    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) throw new UnauthorizedException('Credenciales inválidas');

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresMin = Number(this.config.get<string>('VERIFICATION_EXPIRES_MIN') ?? 10);
    const expiresAt = new Date(Date.now() + expiresMin * 60 * 1000);

    const verification = this.verificationRepository.create({
      user,
      codeHash,
      purpose: 'login',
      expiresAt,
      attempts: 0,
      used: false,
    });

    await this.verificationRepository.save(verification);

    try {
      await this.mailService.sendLoginVerificationEmail(user.email, code, user.username);
    } catch (err) {
      await this.verificationRepository.delete({ id: verification.id });
      throw err;
    }

    return { message: 'Código de verificación enviado al correo' };
  }

  async verifyLoginCode(dto: VerifyCodeDto) {
    const user = await this.usersService.findOneBy.email(dto.email);

    const verification = await this.verificationRepository.findOne({
      where: { user: { id: user.id }, purpose: 'login', used: false },
      order: { createdAt: 'DESC' },
    });

    if (!verification) throw new UnauthorizedException('Código inválido o no solicitado');

    if (verification.expiresAt.getTime() < Date.now()) {
      verification.used = true;
      await this.verificationRepository.save(verification);
      throw new UnauthorizedException('Código expirado');
    }

    const maxAttempts = Number(this.config.get<string>('VERIFICATION_MAX_ATTEMPTS') ?? 5);
    if (verification.attempts >= maxAttempts) {
      verification.used = true;
      await this.verificationRepository.save(verification);
      throw new ForbiddenException('Cuenta bloqueada temporalmente por intentos fallidos');
    }

    const match = await bcrypt.compare(dto.code, verification.codeHash);
    if (!match) {
      verification.attempts += 1;
      await this.verificationRepository.save(verification);
      if (verification.attempts >= maxAttempts) {
        verification.used = true;
        await this.verificationRepository.save(verification);
        throw new ForbiddenException('Cuenta bloqueada temporalmente por intentos fallidos');
      }
      throw new UnauthorizedException('Código inválido');
    }

    verification.used = true;
    await this.verificationRepository.save(verification);

    const payload = { sub: user.id, email: user.email, idRol: user.role.id };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        username: user.username,
        email: user.email,
        role: user.role?.name,
        idRol: user.role.id,
      },
    };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.usersService.findOneBy.email(dto.email);

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresMin = Number(this.config.get<string>('VERIFICATION_EXPIRES_MIN') ?? 10);
    const expiresAt = new Date(Date.now() + expiresMin * 60 * 1000);

    const verification = this.verificationRepository.create({
      user,
      codeHash,
      purpose: 'reset',
      expiresAt,
      attempts: 0,
      used: false,
    });

    await this.verificationRepository.save(verification);
    try {
      await this.mailService.sendPasswordResetEmail(user.email, code, user.username);
    } catch (err) {
      await this.verificationRepository.delete({ id: verification.id });
      throw err;
    }

    return { message: 'Código para restablecer contraseña enviado al correo' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findOneBy.email(dto.email);

    const verification = await this.verificationRepository.findOne({
      where: { user: { id: user.id }, purpose: 'reset', used: false },
      order: { createdAt: 'DESC' },
    });

    if (!verification) throw new UnauthorizedException('Código inválido o no solicitado');

    if (verification.expiresAt.getTime() < Date.now()) {
      verification.used = true;
      await this.verificationRepository.save(verification);
      throw new UnauthorizedException('Código expirado');
    }

    const maxAttempts = Number(this.config.get<string>('VERIFICATION_MAX_ATTEMPTS') ?? 5);
    if (verification.attempts >= maxAttempts) {
      verification.used = true;
      await this.verificationRepository.save(verification);
      throw new ForbiddenException('Cuenta bloqueada temporalmente por intentos fallidos');
    }

    const match = await bcrypt.compare(dto.code, verification.codeHash);
    if (!match) {
      verification.attempts += 1;
      await this.verificationRepository.save(verification);
      if (verification.attempts >= maxAttempts) {
        verification.used = true;
        await this.verificationRepository.save(verification);
        throw new ForbiddenException('Cuenta bloqueada temporalmente por intentos fallidos');
      }
      throw new UnauthorizedException('Código inválido');
    }

    verification.used = true;
    await this.verificationRepository.save(verification);

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePasswordByEmail(user.email, newHash);

    return { message: 'Contraseña restablecida correctamente' };
  }
}