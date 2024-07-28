import { PrismaService } from "src/prisma.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { CreateChatMessageDto } from "./dto/create-chat-message.dto";
import { receiveMessageOnPort } from "worker_threads";

export class ChatService {
    constructor(private prisma: PrismaService) {}

    async createChat (dto: CreateChatDto) {
        return this.prisma.chat.create({
            data: dto
        })
    }

    async createMessage (dto: CreateChatMessageDto) {
        return this.prisma.chat.groupBy({where:{
            messages:{
                every: {
                    OR: [{
                        senderId: 1
                    },{
                        receiverId: 1
                    }]
                }
            }
        }})
        return this.prisma.chatMessage.create({
            data: dto
        })
    }
}
