import { HorecaRequestStatus } from '@prisma/client'
import { TypeValidate, Validate, ValidateEnum } from '@/shared/utils'
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

export class NewHorecaRequestNotificationPayload {
    @Validate(TypeValidate.NUMBER)
    hRequestId: number
    @Validate(TypeValidate.NUMBER)
    hProviderId: number
}

export class NewProviderRequestNotificationPayload {
    @Validate(TypeValidate.NUMBER)
    hRequestId: number
    @Validate(TypeValidate.NUMBER)
    pRequestId: number
}

export class ProviderApprovedNotificationPayload {
    @Validate(TypeValidate.NUMBER)
    pRequestId: number
    @Validate(TypeValidate.NUMBER)
    hRequestId: number
    @ValidateEnum(HorecaRequestStatus, { enum: HorecaRequestStatus, enumName: 'HorecaRequestStatus' })
    status: HorecaRequestStatus
}

export class NewMessageNotificationPayload {
    @Validate(TypeValidate.NUMBER)
    chatId: number
}

export class NotificationPayload {
    @Validate(TypeValidate.OBJECT, {
        oneOf: [
            { $ref: getSchemaPath(NewHorecaRequestNotificationPayload) },
            { $ref: getSchemaPath(ReviewNotificationPayload) },
            { $ref: getSchemaPath(NewProviderRequestNotificationPayload) },
            { $ref: getSchemaPath(ProviderApprovedNotificationPayload) },
            { $ref: getSchemaPath(NewMessageNotificationPayload) },
        ],
    })
    @ValidateNested()
    data:
        | NewHorecaRequestNotificationPayload
        | ReviewNotificationPayload
        | NewProviderRequestNotificationPayload
        | ProviderApprovedNotificationPayload
        | NewMessageNotificationPayload
        | {}
}
