import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
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
import { PaginatedDto } from '../system/utils/dto/paginated.dto'
import { ChatMessageDto } from './dto/chat.message.dto'
import { ChatMessageSearchDto } from './dto/chat.message.search.dto'
import { ChatMessageService } from './services/chat.message.service'
import { SuccessDto } from '../system/utils/dto/success.dto'

@AuthUser(UserRole.Provider, UserRole.Horeca)
@Controller('messages')
@ApiTags('Chats')
export class ChatsMessageController {
    constructor(private readonly service: ChatMessageService) {}

    @Get()
    @RequestPaginatedDecorator(ChatMessageDto)
    @ApiOperation({ summary: 'Get chat messages' })
    async getChatMessages(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<ChatMessageSearchDto>
    ) {
        const [data, total] = await this.service.getChatMessages(auth, paginate)
        return new PaginatedDto<ChatMessageDto>(data, total)
    }

    @Put(':id/view')
    @RequestDecorator()
    @ApiOperation({ summary: 'Mark message viewed' })
    async viewMessage(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') messageId: number) {
        await this.service.viewMessage(auth, +messageId)
        return new SuccessDto('ok')
    }
}
