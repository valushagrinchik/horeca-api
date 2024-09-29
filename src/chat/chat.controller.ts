import { Controller, Get, Param } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import {
    PaginateValidateType,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
} from '../system/utils/swagger/decorators'
import { ChatService } from './services/chat.service'
import { ChatDto } from './dto/chat.dto'
import { ChatSearchDto } from './dto/chat.search.dto'

@Controller('chats')
@ApiTags('Chats')
export class ChatsController {
    constructor(private readonly service: ChatService) {}

    @AuthUser(UserRole.Provider, UserRole.Horeca, UserRole.Admin)
    @Get()
    @RequestPaginatedDecorator(ChatDto)
    @ApiOperation({ summary: 'Get all chats' })
    async getChats(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<ChatSearchDto>
    ) {
        return this.service.getChats(auth, paginate)
    }

    @AuthUser(UserRole.Provider, UserRole.Horeca, UserRole.Admin)
    @Get(':id')
    @RequestPaginatedDecorator(ChatDto)
    @ApiOperation({ summary: 'Get chat' })
    async getChatWithMessages(
        @AuthParamDecorator() auth: AuthInfoDto,
        @Param('id') id: number,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType
    ) {
        return this.service.getChatWithMessages(auth, +id, paginate)
    }
}
