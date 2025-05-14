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
import { RequestDecorator, SuccessDto } from '@/shared/utils'
import { AuthUser, AuthParamDecorator } from '../auth/decorators'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
import { UserRole } from '@prisma/client'

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
