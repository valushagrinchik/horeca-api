import { HorecaRequest, HorecaRequestItem, HorecaRequestStatus, PaymentType } from '@prisma/client'
import { SourceWithUploads } from '../../uploads/dto/upload.dto'
import { HorecaRequestItemDto } from './horecaRequest.item.dto'
import { ApiProperty } from '@nestjs/swagger'

export class HorecaRequestDto extends SourceWithUploads implements HorecaRequest {
    id: number
    userId: number
    address: string
    deliveryTime: Date
    acceptUntill: Date
    paymentType: PaymentType
    name: string
    phone: string
    items: HorecaRequestItemDto[]
    comment: string
    @ApiProperty({ enum: HorecaRequestStatus, enumName: 'HorecaRequestStatus' })
    status: HorecaRequestStatus

    reviewNotificationSent: boolean

    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<HorecaRequest & { items?: HorecaRequestItem[] } & SourceWithUploads>) {
        super()
        Object.assign(this, partial)
    }
}
