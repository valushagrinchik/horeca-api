import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service';
import { ChatsController } from './chat.controller';
import { ChatService } from './chat.service';
import { UsersModule } from '../users/users.module';
import { WebsocketModule } from '../system/websocket/websocket.module';

@Module({
    imports: [UsersModule, WebsocketModule],
    providers: [PrismaService, ChatService],
    controllers: [ChatsController]
})
export class ChatModule {}
