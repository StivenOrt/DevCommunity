import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener token' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('request-login-code')
  @ApiOperation({ summary: 'Solicitar código por correo para iniciar sesión' })
  requestLoginCode(@Body() dto: LoginDto) {
    return this.authService.requestLoginCode(dto);
  }

  @Post('verify-login-code')
  @ApiOperation({ summary: 'Verificar código enviado para iniciar sesión' })
  verifyLoginCode(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyLoginCode(dto);
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Solicitar código para restablecer contraseña' })
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña usando código enviado' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}