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

        const token = client.handshake?.headers?.authorization

        console.log(token)

        console.log(`Nueva conexion: ${client.id}`)
    }

    handleDisconnect(client: Socket) {
        console.log(`Conexion finalizada: ${client.id}`)
    }

    // sendMessage es evento de USER > SERVER
    @SubscribeMessage('sendMessage')
    handleMessage(@ConnectedSocket() client: Socket, @MessageBody() message: string) {
        console.log(`${client.id} ha enviado el mensaje: ${message}`)

        // message.update es evento de SERVER > USER
        this.server.emit('message.update', message)
    }


}