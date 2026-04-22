import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Type,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export function crearAutorGuard<T extends { id: number; author: { id: number } }>(
  entidad: new () => T,
): Type<CanActivate> {
  class AutorGuard implements CanActivate {
    repository: Repository<T>;

    constructor(
      @InjectRepository(entidad)
      repository: Repository<T>,
    ) {
      this.repository = repository;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const id = Number(request.params.id);

      const recurso = await this.repository.findOne({
        where: { id } as any,
        relations: ['author'],
      });

      if (!recurso) throw new NotFoundException('Recurso no encontrado');

      if (recurso.author.id !== user.id) {
        throw new ForbiddenException(
          'No tienes permiso para modificar este recurso',
        );
      }

      return true;
    }
  }

  Injectable()(AutorGuard);
  return AutorGuard;
}