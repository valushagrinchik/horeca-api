import { Controller, Get, Param, Put } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser, AuthParamDecorator } from '../auth/decorators'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
} from '../system/utils/swagger/decorators'
import { PaginatedDto } from '../system/utils/dto/paginated.dto'
import { ChatMessageDto } from './dto/chat.message.dto'
import { ChatMessageSearchDto } from './dto/chat.message.search.dto'
import { ChatMessageService } from './services/chat.message.service'
import { SuccessDto } from '../system/utils/dto/success.dto'
import { WsMessageCreateDto } from './dto/ws.message.create.dto'

@AuthUser(UserRole.Provider, UserRole.Horeca, UserRole.Admin)
@Controller('messages')
@ApiTags('Chats')
@ApiExtraModels(WsMessageCreateDto)
export class ChatsMessageController {
    constructor(private readonly service: ChatMessageService) {}

    @Get()
    @RequestPaginatedDecorator(ChatMessageDto, ChatMessageSearchDto)
    @ApiOperation({ summary: 'Получить список сообщений чата. Роль пользователя: Поставщик/Хорека/Админ' })
    async getChatMessages(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator<ChatMessageSearchDto>({ search: ChatMessageSearchDto })
        paginate: PaginateValidateType<ChatMessageSearchDto>
    ) {
        const [data, total] = await this.service.getChatMessages(auth, paginate)
        return new PaginatedDto<ChatMessageDto>(data, total)
    }

    @Put(':id/view')
    @RequestDecorator()
    @ApiOperation({ summary: 'Пометить сообщение как прочитанное. Роль пользователя: Поставщик/Хорека/Админ' })
    async viewMessage(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') messageId: number) {
        await this.service.viewMessage(auth, +messageId)
        return new SuccessDto('ok')
    }
}
