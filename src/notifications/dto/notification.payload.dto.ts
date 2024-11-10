import { HorecaRequestStatus } from '@prisma/client'
import { TypeValidate, Validate, ValidateEnum } from '../../system/utils/validation/validate.decotators'
import { getSchemaPath } from '@nestjs/swagger'
import { ValidateNested } from 'class-validator'

export class ReviewNotificationPayload {
    @Validate(TypeValidate.NUMBER)
    hRequestId: number
    @Validate(TypeValidate.NUMBER)
    pRequestId: number
    @Validate(TypeValidate.NUMBER)
    chatId: number
}

export class ProviderRequestCreatedNotificationPayload {
    @Validate(TypeValidate.NUMBER)
    hRequestId: number
    @Validate(TypeValidate.NUMBER)
    pRequestId: number
}

export class ProviderRequestStatusChangedNotificationPayload {
    @Validate(TypeValidate.NUMBER)
    pRequestId: number
    @Validate(TypeValidate.NUMBER)
    hRequestId: number
    @ValidateEnum(HorecaRequestStatus, { enum: HorecaRequestStatus, enumName: 'HorecaRequestStatus' })
    status: HorecaRequestStatus
}

export class ProviderAddedToFavouritesNotificationPayload {
    @Validate(TypeValidate.NUMBER)
    horecaId: number
}

export class ProviderDeletedFromFavouritesNotificationPayload {
    @Validate(TypeValidate.NUMBER)
    horecaId: number
}

export class NotificationPayload {
    @Validate(TypeValidate.OBJECT, {
        oneOf: [
            { $ref: getSchemaPath(ReviewNotificationPayload) },
            { $ref: getSchemaPath(ProviderRequestCreatedNotificationPayload) },
            { $ref: getSchemaPath(ProviderRequestStatusChangedNotificationPayload) },
            { $ref: getSchemaPath(ProviderAddedToFavouritesNotificationPayload) },
            { $ref: getSchemaPath(ProviderDeletedFromFavouritesNotificationPayload) },
        ],
    })
    @ValidateNested()
    data:
        | ReviewNotificationPayload
        | ProviderRequestCreatedNotificationPayload
        | ProviderRequestStatusChangedNotificationPayload
        | ProviderAddedToFavouritesNotificationPayload
        | ProviderDeletedFromFavouritesNotificationPayload
        | {}
}
