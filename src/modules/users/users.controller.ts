import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolsGuard } from '../auth/guards/rols.guard';
import { Rols } from '../auth/decorators/rols.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Rols('admin')
  @UseGuards(RolsGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}