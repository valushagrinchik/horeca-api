import {
    HorecaRequest,
    HorecaRequestItem,
    HorecaRequestProviderStatus,
    HorecaRequestStatus,
    PaymentType,
    ProviderRequest,
} from '@prisma/client'
import { SourceWithUploads } from '../../uploads/dto/upload.dto'
import { HorecaRequestItemDto } from './horecaRequest.item.dto'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { ValidateNested } from 'class-validator'
import { Exclude } from 'class-transformer'

class HorecaRequestProviderStatusDto implements HorecaRequestProviderStatus {
    horecaRequestId: number
    viewed: boolean
    hidden: boolean
    providerId: number
    createdAt: Date
    updatedAt: Date
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
    @ValidateNested({ each: true })
    items: HorecaRequestItemDto[]
    comment: string
    @ApiProperty({ enum: HorecaRequestStatus, enumName: 'HorecaRequestStatus' })
    status: HorecaRequestStatus

    @ApiHideProperty()
    @Exclude()
    reviewNotificationSent: boolean

    horecaRequestProviderStatus?: HorecaRequestProviderStatusDto

    createdAt: Date
    updatedAt: Date

    cover?: number

    constructor(
        h: Partial<
            HorecaRequest & {
                items?: HorecaRequestItem[]
                horecaRequestProviderStatus?: HorecaRequestProviderStatus
                providerRequests?: ProviderRequest[]
            } & SourceWithUploads
        >
    ) {
        super()
        Object.assign(this, h)
        this.images = h.images
        this.items = (h.items || []).map(item => new HorecaRequestItemDto(item))
    }
}
