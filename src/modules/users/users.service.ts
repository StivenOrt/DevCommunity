import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/users.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { RoleService } from "../roles/roles.service";
import { hash } from "bcrypt";
import { RolesEnum } from "src/common/enums/roles.enums";


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly roleRepository: RoleService
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find({
      relations: { role: true }
    });
  }

  findOneBy = {

    uuid: async(uuid: string): Promise<UserEntity> => {

      const user = await this.userRepository.findOne({
        where: { uuid },
        relations: { role: true }
      })
      if (!user) throw new NotFoundException('No existe ese usuario')
      return user;
    },

    id: async(id: number): Promise<UserEntity> => {

      const user = await this.userRepository.findOne({
        where: { id },
        relations: { role: true }
      });
      if (!user) throw new NotFoundException('No existe ese usuario')
      return user;
    },

    email: async(email: string): Promise<UserEntity> => {

      const user = await this.userRepository.findOne({
        where: { email },
        relations: { role: true }
      });
      if (!user) throw new NotFoundException('No existe ese usuario')
      return user
    }

  }


  async create(createUserDto: CreateUserDto) {

    const { roleName, password, ...newData } = createUserDto;

    const newRoleData: Partial<UserEntity> = { ...newData }

    if (roleName) newRoleData.role = await this.roleRepository.findOneBy.name(roleName)
    else newRoleData.role = await this.roleRepository.findOneBy.name(RolesEnum.USER)

    newRoleData.passwordHash = await hash(password, 10);

    const user = this.userRepository.create(newRoleData);
    
    return this.userRepository.save(user);
  }

  async updatePasswordByEmail(email: string, newHash: string) {
    const res = await this.userRepository.update({ email }, { passwordHash: newHash });
    return res;
  }
}
