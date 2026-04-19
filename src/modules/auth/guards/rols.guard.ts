import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLS_KEY } from '../decorators/rols.decorator';

interface RequestWithUser {
  user: { rol: string };
}

@Injectable()
export class RolsGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(ROLS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesRequeridos) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    return rolesRequeridos.includes(user.rol);
  }
}