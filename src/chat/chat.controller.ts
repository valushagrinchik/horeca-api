import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
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

@AuthUser(UserRole.Provider, UserRole.Horeca)
@Controller('chats')
@ApiTags('Chats')
export class ChatsController {
    constructor(private readonly service: ChatService) {}

    @RequestPaginatedDecorator(ChatDto)
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType
    ) {
        return this.service.getChats(auth, paginate)
    }

    @Get(':id')
    @RequestDecorator(ChatDto)
    async getChat(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.service.getChat(auth, id)
    }

    @Post()
    @RequestDecorator(ChatDto, ChatCreateDto)
    async createChat(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: ChatCreateDto) {
        return this.service.createChat(auth, dto)
    }
}
