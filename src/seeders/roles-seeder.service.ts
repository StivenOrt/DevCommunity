import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RolesEntity } from "../modules/roles/entities/roles.entity";
import { Repository } from "typeorm";
import { RolesEnum } from "src/common/enums/rols.enums";

@Injectable()
export class RolesSeedService implements OnModuleInit {

    constructor(
        @InjectRepository(RolesEntity)
        private readonly roleRepository: Repository<RolesEntity>
    ) {}

    async onModuleInit() {
        const count = await this.roleRepository.count();
        if (count === 0) {
            await this.roleRepository.save([
                { name: RolesEnum.ADMIN },
                { name: RolesEnum.MODERATOR },
                { name: RolesEnum.USER },
            ]);
        }
    }

    async seedRoles() {
        const rolesToCreate = Object.values(RolesEnum);

        for (const role of rolesToCreate) {
            await this.roleRepository.upsert(
                { name: role },
                [ 'name' ]
            )
        }

        console.log(`[] - Seeder de Roles: Ejecutado`)
    }
}