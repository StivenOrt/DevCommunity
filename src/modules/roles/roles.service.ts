import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesEntity } from './entities/roles.entity';
import { Not, Repository } from 'typeorm';
import { RolesEnum } from 'src/common/enums/rols.enums';


@Injectable()
export class RoleService {

  constructor(
    @InjectRepository(RolesEntity)
    private readonly RoleRepository: Repository<RolesEntity>
  ) {}

  async findAll() {
    return this.RoleRepository.find()
  }

  findOneBy = {

    uuid: async (uuid: string) => {
      const role = await this.RoleRepository.findOneBy({ uuid })

      if (!role) throw new NotFoundException( 'No existe ese ROL' )
      return role
    },

    name: async (name: RolesEnum) => {
      const role = await this.RoleRepository.findOneBy({ name })

      if (!role) throw new NotFoundException( 'No existe ese ROL' )
      return role
    }

  }
}
