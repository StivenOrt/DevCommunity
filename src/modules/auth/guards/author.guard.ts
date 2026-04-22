import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AutorGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const entidad = this.reflector.get<any>('autor', context.getHandler());

    if (!entidad) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const id = Number(request.params.id);

    const repository = this.dataSource.getRepository(entidad as any);

    const recurso = await repository.findOne({
      where: { id },
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