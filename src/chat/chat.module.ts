import { forwardRef, Logger, Module } from '@nestjs/common'
import { ChatsController } from './chat.controller'
import { ChatService } from './services/chat.service'
import { UsersModule } from '../users/users.module'
import { ChatWsGateway } from './chat.ws.gateway'
import { ChatDBService } from './services/chat.db.service'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './../system/database/database.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UsersModule,
        forwardRef(() => DatabaseModule)

    ],
    providers: [ChatWsGateway, ChatDBService, ChatService],
    controllers: [ChatsController],
    exports: [ChatService],
})
export class ChatModule {}
