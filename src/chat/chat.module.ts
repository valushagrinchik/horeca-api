import { Module } from '@nestjs/common'
import { ChatsController } from './chat.controller'
import { ChatService } from './services/chat.service'
import { UsersModule } from '../users/users.module'
import { ChatWsGateway } from './chat.ws.gateway'
import { ChatDbService } from './services/chat.db.service'
import { ConfigModule } from '@nestjs/config'
import { HorecaRequestsModule } from '../horecaRequests/horecaRequests.module'
import { FavouritesModule } from '../favourites/favourites.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UsersModule,
        HorecaRequestsModule,
        FavouritesModule,
    ],
    providers: [ChatWsGateway, ChatDbService, ChatService],
    controllers: [ChatsController],
    exports: [ChatService],
})
export class ChatModule {}
