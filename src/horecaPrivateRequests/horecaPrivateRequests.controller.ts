import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'
import { AuthUser, AuthParamDecorator } from '../auth/decorators'
import { RequestDecorator } from '@/shared/utils'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
import { HorecaPrivateRequestsService } from './horecaPrivateRequests.service'
import { HorecaRequestCreatePrivateDto } from './dto/horecaRequest.create.private.dto'
import { HorecaPrivateRequestDto } from './dto/horecaPrivateRequests.dto'

@AuthUser(UserRole.Horeca)
@Controller('horeca/requests/private')
@ApiTags('HorecaPrivateRequests')
export class HorecaPrivateRequestsController {
    constructor(private readonly service: HorecaPrivateRequestsService) {}

    @Post()
    @ApiOperation({
        summary:
            'Создать список необходимых продуктов(категорий), чтобы отправить поставщику, добавленному в фавориты. Роль пользователя: Хорека',
    })
    @RequestDecorator(HorecaPrivateRequestDto, HorecaRequestCreatePrivateDto)
    async createPrivate(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: HorecaRequestCreatePrivateDto) {
        return this.service.create(auth, dto)
    }
}
