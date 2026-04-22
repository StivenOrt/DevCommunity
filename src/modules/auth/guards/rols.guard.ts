import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>('rols', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesRequeridos) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return rolesRequeridos.includes(user.idRol.toString());
  }
}