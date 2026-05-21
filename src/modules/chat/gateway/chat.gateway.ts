import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UsersService } from "src/modules/users/users.service";
import { ChatService } from "../chat.service";
import { FriendsService } from "src/modules/friends/friends.service";
import * as jwt from "jsonwebtoken";

interface AuthenticatedSocket extends Socket {
    user?: any;
}

@WebSocketGateway({
    cors: { origin: '*' },
    path: '/chat/socket.io'
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private readonly userService: UsersService,
        private readonly chatService: ChatService,
        private readonly friendService: FriendsService
    ) {}

    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        server.use((socket: AuthenticatedSocket, next) => {
            try {
                let token = socket.handshake?.headers?.authorization || socket?.handshake?.auth?.token;

                if (!token) return next(new Error('No se proporcionó un token de autenticación'));

                if (token.startsWith('Bearer ')) token = token.slice(7, token.length).trim();

                const decoded = jwt.verify(token, process.env.JWT_SECRET!);

                socket.user = decoded;
                next();
            } catch(error) {
                console.log(error);
                return next(new Error('Error al validar el token'));
            }
        });
    }


    @SubscribeMessage('joinChat')
    async handleJoinChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() body: { chatUuid: string }) {
        
        const chat = await this.chatService.findOneBy.uuid(body.chatUuid)

        client.join(chat.uuid);
        console.log(`Cliente [${client.id}] se unió a la sala: ${chat.uuid}`);
        
        client.emit('joinedChat', { chatUuid: chat.uuid });
    }

    @SubscribeMessage('leaveChat')
    async handleLeaveChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() body: { chatUuid: string }) {
        
        const chat = await this.chatService.findOneBy.uuid(body.chatUuid)

        client.leave(chat.uuid);
        
        console.log(`Cliente [${client.id}] salió de la sala: ${chat.uuid}`);
    }

    handleConnection(client: AuthenticatedSocket) {
        console.log(`Nueva conexion: ${client.id}`);
        console.log(client.user.uuid);
    }

    handleDisconnect(client: AuthenticatedSocket) {
        console.log(`Conexion finalizada: ${client.id}`);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage( @ConnectedSocket() client: AuthenticatedSocket,  @MessageBody() body: { text: string, chatUuid: string }) {
        try {

            const chat = await this.chatService.findOneBy.uuid(body.chatUuid)
            const user = client.user;
            
            console.log(`Usuario [${user.uuid}] envió: "${body.text}" en sala: ${chat.uuid}`);

            const nuevoMensaje = await this.chatService.messages.create({
                senderUuid: user.sub,
                chatUuid: chat.uuid,
                content: body.text
            })

            const messagePayload = {
                id: nuevoMensaje.uuid,
                text: body.text,
                createdAt: new Date(),
                user: {
                    uuid: user.uuid,
                    username: user.email
                }
            };

            this.server.to(chat.uuid).emit('message.update', messagePayload);


        } catch (error) {
            console.error('Error al procesar el mensaje:', error);
            client.emit('error', { message: 'No se pudo enviar el mensaje' });
        }
    }
}