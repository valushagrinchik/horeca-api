import { HorecaRequest, HorecaRequestItem, PaymentType } from '@prisma/client'
import { SourceWithUploads } from '../../uploads/dto/upload.dto'
import { HorecaRequestItemDto } from './horecaRequest.item.dto'
import { ProviderRequestDto } from 'src/providerRequests/dto/providerRequest.dto'

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
    // providerRequests: ProviderRequestDto[]
    comment: string

    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<HorecaRequest & { items?: HorecaRequestItem[] } & SourceWithUploads>) {
        super()
        Object.assign(this, partial)
    }
}
