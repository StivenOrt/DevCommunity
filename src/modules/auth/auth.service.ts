import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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
}