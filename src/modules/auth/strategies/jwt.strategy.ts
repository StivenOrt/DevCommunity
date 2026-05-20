import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('JWT_SECRET')
    });
  }

  async validate(payload: { sub: number; email: string; idRol: number }) {
    const user = await this.usersService.findOneBy.id(payload.sub);
    if (!user) throw new UnauthorizedException();
    return {
  id: user.id,
  uuid: user.uuid,
  username: user.username,
  email: user.email,
  passwordHash: user.passwordHash,
  role: user.role,
  idRol: payload.idRol,       // ← mismo valor que antes
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  deletedAt: user.deletedAt,
};
  }
}