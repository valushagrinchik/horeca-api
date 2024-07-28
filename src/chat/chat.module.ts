import { Module } from '@nestjs/common'
import { ChatGateway } from './chat.gateway';
import { PrismaService } from 'src/prisma.service';

@Module({
    providers: [PrismaService, ChatGateway]
})
export class ChatModule {}
