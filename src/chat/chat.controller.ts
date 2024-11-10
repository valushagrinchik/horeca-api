import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
} from '../system/utils/swagger/decorators'
import { ChatService } from './services/chat.service'
import { ChatDto } from './dto/chat.dto'
import { ChatCreateDto } from './dto/chat.create.dto'
import { ChatSearchDto } from './dto/chat.search.dto'
import { PaginatedDto } from '../system/utils/dto/paginated.dto'
import {
    ChatFullDto,
    ChatProviderRequestDto,
    ChatHorecaRequestDto,
    ChatProviderRequestReviewDto,
    ChatHorecaFavouritesDto,
    ChatSupportRequestDto,
} from './dto/chat.full.dto'

@AuthUser(UserRole.Provider, UserRole.Horeca, UserRole.Admin)
@Controller('chats')
@ApiTags('Chats')
export class ChatsController {
    constructor(private readonly service: ChatService) {}

    @Post()
    @RequestDecorator(ChatDto, ChatCreateDto)
    @ApiOperation({ summary: 'Creates chat' })
    async createChat(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: ChatCreateDto) {
        return this.service.createChat(auth, dto)
    }

    @Get()
    @RequestPaginatedDecorator(ChatDto)
    @ApiOperation({ summary: 'Get all chats' })
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<ChatSearchDto>
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
    @ApiOperation({ summary: 'Get chat' })
    async getChat(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.service.validate(auth, +id)
        const chat = await this.service.getChat(+id)
        return new ChatFullDto({
            ...chat,
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
