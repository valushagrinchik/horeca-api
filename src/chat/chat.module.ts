import { Module } from '@nestjs/common'
import { ChatsController } from './chat.controller'
import { ChatService } from './services/chat.service'
import { UsersModule } from '../users/users.module'
import { ChatWsGateway } from './chat.ws.gateway'
import { ChatDbService } from './services/chat.db.service'
import { ConfigModule } from '@nestjs/config'
import { ChatSupportService } from './services/chat.support.service'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UsersModule,
    ],
    providers: [ChatDbService, ChatService, ChatSupportService, ChatWsGateway],
    controllers: [ChatsController],
    exports: [ChatService, ChatSupportService],
})
export class ChatModule {}
