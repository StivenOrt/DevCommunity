import { Module } from '@nestjs/common';
import { RolesEntity } from './entities/roles.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesSeedService } from 'src/seeders/roles-seeder.service';
import { RoleService } from './roles.service';


@Module({
  imports: [TypeOrmModule.forFeature([RolesEntity])],
  providers: [RoleService, RolesSeedService],
  exports: [RoleService],

})
export class RoleModule { }