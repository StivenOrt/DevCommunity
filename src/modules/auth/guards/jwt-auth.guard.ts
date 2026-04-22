import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_ERRORS } from 'src/common/constants/error-messages';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) throw err || new UnauthorizedException( JWT_ERRORS.UNAUTHORIZED() );
    
    return user;
  }
}