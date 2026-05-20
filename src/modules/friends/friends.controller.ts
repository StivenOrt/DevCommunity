import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { UpdateFriendStatusDto } from './dto/update-friend-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserEntity } from '../users/entities/users.entity';
import { FriendshipEntity } from './entities/friendship.entity';

@ApiTags('Friends')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  // ── POST /friends/request ──────────────────────────────────────────────────
  @Post('request')
  @ApiOperation({ summary: 'Enviar solicitud de amistad' })
  @ApiResponse({ status: 201, description: 'Solicitud enviada correctamente.' })
  @ApiResponse({ status: 400, description: 'Relación ya existente o parámetro inválido.' })
  sendRequest(
    @GetUser() currentUser: UserEntity,
    @Body() dto: CreateFriendRequestDto,
  ) {
    return this.friendsService.sendFriendRequest(currentUser, dto);
  }

  // ── PATCH /friends/request/:uuid ──────────────────────────────────────────
  @Patch('request/:uuid')
  @ApiOperation({ summary: 'Aceptar o rechazar una solicitud de amistad recibida' })
  @ApiParam({ name: 'uuid', description: 'UUID de la solicitud de amistad' })
  @ApiResponse({ status: 200, description: 'Solicitud respondida correctamente.' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada.' })
  respondToRequest(
    @GetUser() currentUser: UserEntity,
    @Param('uuid') requestUuid: string,
    @Body() dto: UpdateFriendStatusDto,
  ) {
    return this.friendsService.respondToRequest(currentUser, requestUuid, dto);
  }

  // ── POST /friends/block/:uuid ──────────────────────────────────────────────
  @Post('block/:uuid')
  @ApiOperation({ summary: 'Bloquear a un usuario' })
  @ApiParam({ name: 'uuid', description: 'UUID del usuario a bloquear' })
  @ApiResponse({ status: 201, description: 'Usuario bloqueado.' })
  blockUser(
    @GetUser() currentUser: UserEntity,
    @Param('uuid') targetUuid: string,
  ) {
    return this.friendsService.blockUser(currentUser, targetUuid);
  }

  // ── GET /friends ───────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Obtener lista de amigos del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de amigos' })
  getMyFriends(@GetUser() currentUser: UserEntity) {
    return this.friendsService.getMyFriends(currentUser);
  }

  @Get('blockeds')
  @ApiOperation({ summary: 'Obtener lista de bloqueados del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de bloqueados' })
  getMyBlocks(@GetUser() currentUser: UserEntity) {
    return this.friendsService.getMyBlocks(currentUser);
  }

  // ── GET /friends/pending ───────────────────────────────────────────────────
  @Get('pending')
  @ApiOperation({ summary: 'Obtener solicitudes de amistad pendientes recibidas' })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes pendientes.' })
  getPendingRequests(@GetUser() currentUser: UserEntity) {
    return this.friendsService.getPendingRequests(currentUser);
  }

  // ── DELETE /friends/:uuid ──────────────────────────────────────────────────
  @Delete(':uuid')
  @ApiOperation({ summary: 'Cancelar solicitud enviada o eliminar amistad' })
  @ApiParam({ name: 'uuid', description: 'UUID de la relación de amistad' })
  @ApiResponse({ status: 200, description: 'Relación eliminada.' })
  @ApiResponse({ status: 404, description: 'Relación no encontrada.' })
  removeFriendship(
    @GetUser() currentUser: UserEntity,
    @Param('uuid') requestUuid: string,
  ) {
    return this.friendsService.removeFriendship(currentUser, requestUuid);
  }
}
