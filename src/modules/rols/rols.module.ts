import { Module } from '@nestjs/common';
import { RolsEntity } from './entities/rols.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolsSeedService } from './rolsSeed.service';

@Module({
  imports: [TypeOrmModule.forFeature([RolsEntity])],
  providers: [RolsSeedService],
  exports: [TypeOrmModule],

})
export class RolModule { }