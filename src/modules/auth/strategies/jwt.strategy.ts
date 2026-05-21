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

  async validate(payload: { sub: string; email: string; idRol: number }) {

    const user = await this.usersService.findOneBy.uuid(payload.sub);

    if (!user) throw new UnauthorizedException();

    return {
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      role: user.role,
      idRol: payload.idRol
    };
  }
}