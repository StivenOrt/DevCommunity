import { Module } from '@nestjs/common';
import { RolesEntity } from './entities/roles.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolsSeedService } from 'src/seeders/roles-seeder.service';


@Module({
  imports: [TypeOrmModule.forFeature([RolesEntity])],
  providers: [RolsSeedService],
  exports: [TypeOrmModule],

})
export class RoleModule { }