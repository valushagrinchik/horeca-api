import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
import { AuthParamDecorator } from '../auth/decorators/auth.param.decorator'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
    PaginatedDto,
} from '@/shared/utils'
import { ChatService } from './services/chat.service'
import { ChatDto } from './dto/chat.dto'
import { ChatCreateDto } from './dto/chat.create.dto'
import { ChatSearchDto } from './dto/chat.search.dto'

import {
    ChatFullDto,
    ChatProviderRequestDto,
    ChatHorecaRequestDto,
    ChatProviderRequestReviewDto,
    ChatHorecaFavouritesDto,
    ChatSupportRequestDto,
} from './dto/chat.full.dto'
import { ChatMessageDto } from './dto/chat.message.dto'
import { UserDto } from '../users/dto/user.dto'

@AuthUser(UserRole.Provider, UserRole.Horeca, UserRole.Admin)
@Controller('chats')
@ApiTags('Chats')
export class ChatsController {
    constructor(private readonly service: ChatService) {}

    @Post()
    @RequestDecorator(ChatDto, ChatCreateDto)
    @ApiOperation({ summary: 'Создать чат. Роль пользователя: Поставщик/Хорека/Админ' })
    async createChat(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: ChatCreateDto) {
        return this.service.createChat(auth, dto)
    }

    @Get()
    @RequestPaginatedDecorator(ChatDto, ChatSearchDto)
    @ApiOperation({ summary: 'Получить список чатов. Роль пользователя: Поставщик/Хорека/Админ' })
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator<ChatSearchDto>({ search: ChatSearchDto })
        paginate: PaginateValidateType<ChatSearchDto>
    ) {
        const [data, total] = await this.service.findAllAndCount(auth, paginate)
        return new PaginatedDto<ChatDto>(data, total)
    }

    @Get(':id')
    @RequestDecorator(ChatFullDto)
    @ApiExtraModels(
        ChatProviderRequestDto,
        ChatHorecaRequestDto,
        ChatProviderRequestReviewDto,
        ChatHorecaFavouritesDto,
        ChatSupportRequestDto
    )
    @ApiOperation({ summary: 'Получить чат по id. Роль пользователя: Поставщик/Хорека/Админ' })
    async getChat(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.service.validate(auth, +id)
        const chat = await this.service.getChat(+id)
        return new ChatFullDto({
            ...chat,
            messages: chat.messages.map(
                message =>
                    new ChatMessageDto({
                        ...message,
                        ...(message.author ? { author: new UserDto(message.author) } : {}),
                    })
            ),
            ...(chat.providerRequest
                ? {
                      providerRequest: new ChatProviderRequestDto({
                          ...chat.providerRequest,
                          horecaRequest: new ChatHorecaRequestDto(chat.providerRequest.horecaRequest),
                          ...(chat.providerRequest.providerRequestReview
                              ? {
                                    providerRequestReview: new ChatProviderRequestReviewDto(
                                        chat.providerRequest.providerRequestReview
                                    ),
                                }
                              : {}),
                      }),
                  }
                : {}),
            ...(chat.horecaFavourites ? { horecaFavourites: new ChatHorecaFavouritesDto(chat.horecaFavourites) } : {}),
            ...(chat.supportRequest ? { supportRequest: new ChatSupportRequestDto(chat.supportRequest) } : {}),
        })
    }
}
