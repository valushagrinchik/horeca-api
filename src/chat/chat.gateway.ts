import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'

import { Server } from 'socket.io'
import { ChatService } from './chat.service'

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway {
    constructor(private chatService: ChatService) {}

    @WebSocketServer()
    server: Server

    @SubscribeMessage('sendMessage')
    async handleSendMessage(client: Socket, payload: Chat): Promise<void> {
      await this.chatService.createMessage(payload);
      this.server.emit('recMessage', payload);
    }
    
}
