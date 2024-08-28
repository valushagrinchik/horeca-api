import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthParamDecorator } from '../utils/auth/decorators/auth.param.decorator'
import { PaginateValidateType, RequestPaginatedDecorator, RequestPaginatedValidateParamsDecorator } from '../utils/swagger/decorators'
import { ChatService } from './chat.service'
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


    @Post()
    async createChat(
        @AuthParamDecorator() auth: AuthInfoDto,
        @Body() dto: ChatCreateDto
    ) {
        return this.service.createChat(auth, dto)
    }
}
