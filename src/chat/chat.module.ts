import { forwardRef, Module } from '@nestjs/common'
import { ChatsController } from './chat.controller'
import { ChatService } from './services/chat.service'
import { UsersModule } from '../users/users.module'
import { ChatWsGateway } from './chat.ws.gateway'
import { ChatDbService } from './services/chat.db.service'
import { ConfigModule } from '@nestjs/config'
import { HorecaRequestsModule } from '../horecaRequests/horecaRequests.module'
import { FavouritesModule } from '../favourites/favourites.module'
import { ChatMessageDbService } from './services/chat.message.db.service'
import { ChatMessageService } from './services/chat.message.service'
import { ChatsMessageController } from './chat.message.controller'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UsersModule,
        FavouritesModule,
        forwardRef(() => HorecaRequestsModule),
    ],
    providers: [ChatWsGateway, ChatDbService, ChatService, ChatMessageDbService, ChatMessageService],
    controllers: [ChatsController, ChatsMessageController],
    exports: [ChatService, ChatWsGateway],
})
export class ChatModule {}
