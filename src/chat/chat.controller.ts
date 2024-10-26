import { Body, Controller, Get, Param, Post } from '@nestjs/common'
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
import { ChatService } from './services/chat.service'
import { ChatDto } from './dto/chat.dto'
import { ChatCreateDto } from './dto/chat.create.dto'
import { ChatSearchDto } from './dto/chat.search.dto'
import { PaginatedDto } from '../system/utils/dto/paginated.dto'
import { ChatMessageDto } from './dto/chat.message.dto'

@AuthUser(UserRole.Provider, UserRole.Horeca)
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
    @RequestDecorator(ChatDto)
    @ApiOperation({ summary: 'Get chat' })
    async getChat(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.service.getChat(auth, +id)
    }

    @Get(':id/messages')
    @RequestPaginatedDecorator(ChatMessageDto)
    @ApiOperation({ summary: 'Get chat messages' })
    async getChatMessages(
        @AuthParamDecorator() auth: AuthInfoDto,
        @Param('id') id: number,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType
    ) {
        const [data, total] = await this.service.getChatMessages(auth, +id, paginate)
        return new PaginatedDto<ChatMessageDto>(data, total)
    }
}
