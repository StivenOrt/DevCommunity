import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RolsEntity } from '../rols/entities/rols.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RolsEnum } from '../../common/enums/rols.enums';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        @InjectRepository(RolsEntity)
        private readonly rolesRepository: Repository<RolsEntity>,
    ) { }

    async register(dto: RegisterDto) {
        const existe = await this.usersService.findByEmail(dto.email);
        if (existe) throw new ConflictException('El email ya está registrado');

        const rolUsuario = await this.rolesRepository.findOne({
            where: { name: RolsEnum.USER },
        });

        if (!rolUsuario) throw new Error('Los roles no han sido inicializados');

        const hash = await bcrypt.hash(dto.password, 10);

        const nuevoUsuario = await this.usersService.create({
            username: dto.username,
            email: dto.email,
            password: hash,
            roleId: rolUsuario?.id,
        });

        const { password, ...result } = nuevoUsuario;
        return result;
    }

    async login(dto: LoginDto) {
        const usuario = await this.usersService.findByEmail(dto.email);
        if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

        const passwordValido = await bcrypt.compare(dto.password, usuario.password);
        if (!passwordValido) throw new UnauthorizedException('Credenciales inválidas');

        const payload = {
            sub: usuario.id,
            username: usuario.username,
            email: usuario.email,
            rol: usuario.role.name,
        };

        return {
            access_token: this.jwtService.sign(payload),
            usuario: {
                username: usuario.username,
                email: usuario.email,
                rol: usuario.role.name,
            },
        };
    }
}