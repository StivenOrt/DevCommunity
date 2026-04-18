import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RolsEntity } from "./entities/rols.entity";
import { Repository } from "typeorm";
import { RolsEnum } from "src/common/enums/rols.enums";

@Injectable()
export class RolsSeedService implements OnModuleInit{
    constructor(
        @InjectRepository(RolsEntity)
        private readonly roleRepository: Repository<RolsEntity>,
    ) { }

    async onModuleInit() {
        const count = await this.roleRepository.count();
        if (count === 0) {
            await this.roleRepository.save([
                { name: RolsEnum.ADMIN },
                { name: RolsEnum.MODERATOR },
                { name: RolsEnum.USER },
            ]);
        }
    }
}