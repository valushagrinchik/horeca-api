import { Controller, Get } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
    NotificationPayload,
    ProviderAddedToFavouritesNotificationPayload,
    ProviderDeletedFromFavouritesNotificationPayload,
    ProviderRequestCreatedNotificationPayload,
    ProviderRequestStatusChangedNotificationPayload,
    ReviewNotificationPayload,
} from './dto/notification.payload.dto'
import { RequestDecorator } from '../system/utils/swagger/decorators'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { UserRole } from '@prisma/client'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { SuccessDto } from '../system/utils/dto/success.dto'

@AuthUser(UserRole.Admin)
@Controller('notifications')
@ApiTags('WS')
@ApiExtraModels(
    NotificationPayload,
    ReviewNotificationPayload,
    ProviderRequestCreatedNotificationPayload,
    ProviderRequestStatusChangedNotificationPayload,
    ProviderAddedToFavouritesNotificationPayload,
    ProviderDeletedFromFavouritesNotificationPayload
)
export class NotificationController {
    @Get()
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Пометить список нотификаций. Роль пользователя: Админ' })
    async get(@AuthParamDecorator() auth: AuthInfoDto) {
        return new SuccessDto('ok')
    }
}
