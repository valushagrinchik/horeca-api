import { ProviderRequest, ProviderRequestItem } from '@prisma/client'
import { SourceWithUploads } from '../../uploads/dto/upload.dto'

export class ProviderRequestItemDto extends SourceWithUploads implements ProviderRequestItem {
    id: number

    providerRequestId: number
    horecaRequestItemId: number
    available: boolean
    manufacturer: string
    cost: number

    createdAt: Date
    updatedAt: Date
    constructor(partial: Partial<ProviderRequest & SourceWithUploads>) {
        super()
        Object.assign(this, partial)
    }
}
