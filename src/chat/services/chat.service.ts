import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { ChatCreateDto } from '../dto/chat.create.dto'
import { ChatType } from '@prisma/client'
import { ChatIncomeMessageCreateDto } from '../dto/chat.income.message.create.dto'
import { ChatDto } from '../dto/chat.dto'
import { ChatDbService } from './chat.db.service'
import { BadRequestException, Inject, forwardRef } from '@nestjs/common'
import { ChatSearchDto } from '../dto/chat.search.dto'
import { ErrorDto } from '../../system/utils/dto/error.dto'
import { ErrorCodes } from '../../system/utils/enums/errorCodes.enum'
import { HorecaRequestsService } from '../../horecaRequests/services/horecaRequests.service'
import { FavouritesService } from '../../favourites/services/favourites.service'
import { ChatServerMessageCreateDto } from '../dto/chat.server.message.create.dto'

export class ChatService {
    constructor(
        @Inject(forwardRef(() => ChatDbService))
        private chatRep: ChatDbService,
        private favouritesService: FavouritesService,
        private horecaRequestsService: HorecaRequestsService
    ) {}

    async findAllAndCount(
        auth: AuthInfoDto,
        paginate: PaginateValidateType<ChatSearchDto>
    ): Promise<[ChatDto[], number]> {
        return this.chatRep.findAllAndCount(auth.id, paginate)
    }

    async getChat(auth: AuthInfoDto, id: number) {
        return this.chatRep.getChat(auth.id, id)
        // return new ChatDto({ ...chat, messages: chat.messages.map(m => new ChatMessageDto(m)) })
    }

    async validateChatCreation(auth: AuthInfoDto, dto: ChatCreateDto) {
        switch (dto.type) {
            case ChatType.Order: {
                const valid = await this.horecaRequestsService.isReadyForChat(auth, {
                    pRequestId: dto.providerRequestId,
                    hRequestId: dto.horecaRequestId,
                })
                if (!valid) {
                    throw new BadRequestException(new ErrorDto(ErrorCodes.FORBIDDEN_ACTION))
                }
                return
            }
            case ChatType.Private: {
                const valid = await this.favouritesService.isReadyForChat(auth, dto.opponentId)
                if (!valid) {
                    throw new BadRequestException(new ErrorDto(ErrorCodes.FORBIDDEN_ACTION))
                }
                return
            }
            default: {
                throw new BadRequestException(new ErrorDto(ErrorCodes.FORBIDDEN_ACTION))
            }
        }
    }

    /** Returns chat object and latest just created message */
    async createChat(auth: AuthInfoDto, dto: ChatCreateDto) {
        await this.validateChatCreation(auth, dto)
        const chat = await this.chatRep.createChat(auth.id, dto)

        const message = await this.createServerMessage({
            message: 'Chat is created',
            chatId: chat.id,
        })

        return new ChatDto({ ...chat, messages: [message] })
    }

    /** Returns chat object and latest just created message */
    async createIncomeMessage(auth: AuthInfoDto, dto: ChatIncomeMessageCreateDto) {
        const chat = await this.chatRep.getChat(auth.id, dto.chatId)
        const message = await this.chatRep.createMessage(dto)
        return new ChatDto({ ...chat, messages: [message] })
    }

    async createServerMessage(dto: ChatServerMessageCreateDto) {
        return this.chatRep.createMessage({ ...dto, isServer: true })
    }
}
