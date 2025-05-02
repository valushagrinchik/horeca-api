import { HorecaRequest, HorecaRequestItem, HorecaRequestProviderStatus, HorecaRequestStatus, PaymentType } from '@prisma/client'
import { SourceWithUploads } from '../../uploads/dto/upload.dto'
import { HorecaRequestItemDto } from './horecaRequest.item.dto'
import { ApiProperty } from '@nestjs/swagger'


class HorecaRequestProviderStatusDto {
    "horecaRequestId": number
    "viewed": boolean
    "hidden": boolean
    "providerId": number
    "createdAt": Date
    "updatedAt": Date
}

export class HorecaRequestDto extends SourceWithUploads implements HorecaRequest {
    id: number
    userId: number
    address: string
    deliveryTime: Date
    acceptUntill: Date
    @ApiProperty({ enum: PaymentType, enumName: 'PaymentType' })
    paymentType: PaymentType
    name: string
    phone: string
    categories: string[]
    items: HorecaRequestItemDto[]
    comment: string
    @ApiProperty({ enum: HorecaRequestStatus, enumName: 'HorecaRequestStatus' })
    status: HorecaRequestStatus

    reviewNotificationSent: boolean

    horecaRequestProviderStatus?:  HorecaRequestProviderStatusDto

    createdAt: Date
    updatedAt: Date

    cover?: number

    constructor(partial: Partial<HorecaRequest & { items?: HorecaRequestItem[], horecaRequestProviderStatus?:  HorecaRequestProviderStatus } & SourceWithUploads>) {
        super()
        Object.assign(this, partial)
    }
}
