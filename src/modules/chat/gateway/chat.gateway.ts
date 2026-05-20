import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
    cors: { origin: '*' },
    path: '/chat/socket.io'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`Nueva conexion: ${client.id}`)
    }

    handleDisconnect(client: Socket) {
        console.log(`Conexion finalizada: ${client.id}`)
    }

    @SubscribeMessage('message.update')
    handleMessage(@ConnectedSocket() client: Socket, @MessageBody() message: string) {
        console.log(`${client.id} ha enviado el mensaje: ${message}`)
    }


}