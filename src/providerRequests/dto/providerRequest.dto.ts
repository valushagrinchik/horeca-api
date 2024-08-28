import { PaymentType, ProviderRequest } from '@prisma/client'
import { SourceWithUploads } from 'src/system/dto/uploads.dto'

export class ProviderRequestDto extends SourceWithUploads implements ProviderRequest {
    id: number
    profileId: number
    horecaRequestId: number
    comment: string
    available: boolean // in stock
    manufacturer: string
    paymentType: PaymentType
    cost: number
    approvedByHoreca: boolean
    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<ProviderRequest & SourceWithUploads>) {
        super()
        Object.assign(this, partial)
    }
}
