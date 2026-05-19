import { RolesEnum } from "src/common/enums/rols.enums";
import { UserEntity } from "../../users/entities/users.entity";
import { Column, Entity, Generated, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('roles')
export class RolesEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'uuid' })
    @Generated('uuid')
    uuid: string;
    
    @Column({
        type: 'varchar',
        length: 50,
        unique: true
    })
    name: RolesEnum;

    @OneToMany( () => UserEntity, user => user.role )
    users: UserEntity[];
}