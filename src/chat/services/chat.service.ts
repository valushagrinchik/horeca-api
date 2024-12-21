import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { ChatCreateDto } from '../dto/chat.create.dto'
import { ChatType, UserRole } from '@prisma/client'
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
import { SupportRequestsService } from '../../supportRequests/services/supportRequests.service'
import { Roles } from 'src/system/utils/auth/decorators/roles.decorator'

export class ChatService {
    constructor(
        @Inject(forwardRef(() => ChatDbService))
        private chatRep: ChatDbService,
        private favouritesService: FavouritesService,
        private horecaRequestsService: HorecaRequestsService,
        private supportRequestsService: SupportRequestsService
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
        let resourse: { chatId: number } = null
        switch (dto.type) {
            case ChatType.Order: {
                resourse = await this.horecaRequestsService.isReadyForChat(auth, {
                    pRequestId: dto.providerRequestId,
                    hRequestId: dto.horecaRequestId,
                })
                break
            }
            case ChatType.Private: {
                resourse = await this.favouritesService.isReadyForChat(auth, {
                    id: dto.horecaFavouriteId,
                    providerId: dto.opponentId,
                })
                break
            }
            case ChatType.Support: {
                resourse = await this.supportRequestsService.isReadyForChat(auth, dto.supportRequestId)
                break
            }
            default: {
                throw new BadRequestException(new ErrorDto(ErrorCodes.FORBIDDEN_ACTION, ['Type is not supported']))
            }
        }
        if (!resourse) {
            throw new BadRequestException(
                new ErrorDto(ErrorCodes.FORBIDDEN_ACTION, ['The necessary conditions for chat creation are not met!'])
            )
        }
        if (resourse.chatId) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.FORBIDDEN_ACTION, ['Chat is already exists!']))
        }
    }

    /** Returns chat object and latest just created message */
    async createChat(auth: AuthInfoDto, dto: ChatCreateDto) {
        if (auth.role != UserRole.Admin && dto.type == ChatType.Support) {
            throw new BadRequestException(
                new ErrorDto(ErrorCodes.FORBIDDEN_ACTION, ['Support chat should be created from the Admin side'])
            )
        }

        await this.validateChatCreation(auth, dto)

        const chat = await this.chatRep.createChat(auth.id, dto)
        const messages = []

        if (chat.type === ChatType.Order) {
            messages.push(
                ...(await Promise.all([
                    this.createServerMessage({
                        message: '[horecaRequest]',
                        chatId: chat.id,
                    }),
                    this.createServerMessage({
                        message: '[providerRequest]',
                        chatId: chat.id,
                    }),
                ]))
            )
        }

        return new ChatDto({ ...chat, messages })
    }

    async createIncomeMessage(dto: WsMessageCreateDto) {
        return this.chatRep.createMessage(dto)
    }

    async createServerMessage(dto: ChatServerMessageCreateDto) {
        return this.chatRep.createMessage({ ...dto, isServer: true })
    }
}
