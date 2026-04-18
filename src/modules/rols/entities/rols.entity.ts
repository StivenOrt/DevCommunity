import { UserEntity } from "../../users/entities/users.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('rols')
export class RolsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 50, unique: true})
    name: string;

    @OneToMany(() => UserEntity, user => user.role)
    users: UserEntity[];
}