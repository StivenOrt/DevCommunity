import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { hash } from "bcrypt";
import { RolesEnum } from "src/common/enums/roles.enums";
import { RoleService } from "src/modules/roles/roles.service";
import { CreateUserDto } from "src/modules/users/dto/create-user.dto";
import { UserEntity } from "src/modules/users/entities/users.entity";
import { Repository } from "typeorm";


@Injectable()
export class UserSeederService implements OnModuleInit {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        private readonly roleRepository: RoleService
    ) {}

    async onModuleInit() {
        await this.seedUsers()
    }

    async seedUsers () {

        const usersToCreate: CreateUserDto[] = [
            {
                username: 'one',
                email: 'one@gmail.com',
                password: 'one',
            },
            {
                username: 'two',
                email: 'two@gmail.com',
                password: 'two',
            },
            {
                username: 'three',
                email: 'three@gmail.com',
                password: 'three',
            }
        ]

        for (const user of usersToCreate) {

            const exist = await this.userRepository.findOne({
                where: { username: user.username }
            })

            if (!exist) {

                const newData: Partial<UserEntity> = { username: user.username }

                newData.passwordHash = await hash(user.password, 10)
                newData.email = user.email

                const role = await this.roleRepository.findOneBy.name(user?.roleName || RolesEnum.USER)

                await this.userRepository.save({
                    ...newData,
                    role
                })
            }
        }

        console.log(`[] - Seeder de Usuarios realizado`)
    }
}