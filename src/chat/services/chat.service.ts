import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { ChatCreateDto } from '../dto/chat.create.dto'
import { ChatType } from '@prisma/client'
import { WsMessageCreateDto } from '../dto/ws.message.create.dto'
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

    async validate(auth: AuthInfoDto, id: number) {
        const horecaRequest = await this.chatRep.getRawById(auth.id, id)
        if (!horecaRequest) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.ITEM_NOT_FOUND))
        }
    }

    async findAllAndCount(
        auth: AuthInfoDto,
        paginate: PaginateValidateType<ChatSearchDto>
    ): Promise<[ChatDto[], number]> {
        return this.chatRep.findAllAndCount(auth.id, paginate)
    }

    async getChat(id: number) {
        return this.chatRep.getChat(id)
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

        const messages = await Promise.all([
            this.createServerMessage({
                message: '[horecaRequest]',
                chatId: chat.id,
            }),
            this.createServerMessage({
                message: '[providerRequest]',
                chatId: chat.id,
            }),
        ])

        return new ChatDto({ ...chat, messages })
    }

    async createIncomeMessage(dto: WsMessageCreateDto) {
        return this.chatRep.createMessage(dto)
    }

    async createServerMessage(dto: ChatServerMessageCreateDto) {
        return this.chatRep.createMessage({ ...dto, isServer: true })
    }
}
