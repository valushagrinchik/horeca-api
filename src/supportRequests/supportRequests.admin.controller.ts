import { Controller, Post, Param, Get } from '@nestjs/common'
import { SupportRequestsService } from './services/supportRequests.service'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser, AuthParamDecorator } from '../auth/decorators'
import { UserRole } from '@prisma/client'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
} from '../system/utils/swagger/decorators'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
import { SuccessDto } from '../system/utils/dto/success.dto'
import { SupportRequestDto } from './dto/supportRequest.dto'
import { PaginatedDto } from '../system/utils/dto/paginated.dto'
import { SupportRequestSearchDto } from './dto/supportRequest.search.dto'

@AuthUser(UserRole.Admin)
@Controller('support/requests')
@ApiTags('SupportRequest')
export class SupportRequestsAdminController {
    constructor(private supportRequestService: SupportRequestsService) {}

    @Post(':id/assign')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Назначить админа на запрос на поддержку от Поставщик/Хорека. Роль пользователя: Админ' })
    async assignAdmin(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.supportRequestService.assignAdmin(auth, +id)
        return new SuccessDto('ok')
    }

    @Get()
    @RequestPaginatedDecorator(SupportRequestDto, SupportRequestSearchDto)
    @ApiOperation({
        summary: 'Получить список всех запросов на поддержку от Поставщик/Хорека. Роль пользователя: Админ',
    })
    async list(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<SupportRequestSearchDto>
    ) {
        const [data, total] = await this.supportRequestService.findAllAndCount(auth, paginate)
        return new PaginatedDto<SupportRequestDto>(data, total)
    }
}
