import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolsGuard } from '../auth/guards/rols.guard';
import { Rols } from '../auth/decorators/rols.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get()
  @Rols('1')
  @UseGuards(JwtAuthGuard, RolsGuard)
  @ApiBearerAuth()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/:uuid')
  @Rols('1')
  @UseGuards(JwtAuthGuard, RolsGuard)
  @ApiBearerAuth()
  findOne(@Param('uuid') uuid: string) {
    return this.usersService.findOneBy.uuid(uuid)
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }
}