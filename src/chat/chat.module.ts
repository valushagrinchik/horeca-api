import { Module } from '@nestjs/common'
import { ChatsController } from './chat.controller'
import { ChatService } from './services/chat.service'
import { UsersModule } from '../users/users.module'
import { ChatWsGateway } from './chat.ws.gateway'
import { ChatDBService } from './services/chat.db.service'

@Module({
    imports: [UsersModule],
    providers: [ChatService, ChatDBService, ChatWsGateway],
    controllers: [ChatsController],
    exports: [ChatService],
})
export class ChatModule {}
