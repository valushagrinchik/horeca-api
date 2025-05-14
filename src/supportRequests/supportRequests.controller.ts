import { Controller, Post, Body, Param, Get } from '@nestjs/common'
import { SupportRequestsService } from './services/supportRequests.service'

import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser, AuthParamDecorator } from '../auth/decorators'
import { UserRole } from '@prisma/client'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
    SuccessDto,
    PaginatedDto,
} from '@/shared/utils'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'

import { SupportRequestCreateDto } from './dto/supportRequest.create.dto'
import { SupportRequestDto } from './dto/supportRequest.dto'
import { SupportRequestSearchDto } from './dto/supportRequest.search.dto'

@AuthUser(UserRole.Provider, UserRole.Horeca)
@Controller('support/requests')
@ApiTags('SupportRequest')
export class SupportRequestsController {
    constructor(private supportRequestService: SupportRequestsService) {}

    @Post()
    @RequestDecorator(SupportRequestDto, SupportRequestCreateDto)
    @ApiOperation({ summary: 'Создать запрос на поддержку. Роль пользователя: Поставщик/Хорека' })
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: SupportRequestCreateDto) {
        const response = await this.supportRequestService.create(auth, dto)
        return new SupportRequestDto(response)
    }

    @Post(':id/resolve')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Пометить запрос на поддержку как выполненный. Роль пользователя: Поставщик/Хорека' })
    async resolve(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.supportRequestService.resolve(auth, +id)
        return new SuccessDto('ok')
    }

    @Get('mine')
    @RequestPaginatedDecorator(SupportRequestDto, SupportRequestSearchDto)
    @ApiOperation({ summary: 'Получить список запросов на поддержку. Роль пользователя: Поставщик/Хорека' })
    async list(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator<SupportRequestSearchDto>({
            search: SupportRequestSearchDto,
        })
        paginate: PaginateValidateType<SupportRequestSearchDto>
    ) {
        const [data, total] = await this.supportRequestService.findAllAndCount(auth, paginate, true)
        return new PaginatedDto<SupportRequestDto>(data, total)
    }
}
