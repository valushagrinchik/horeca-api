import { ProviderRequest } from '@prisma/client'
import { SourceWithUploads } from '../../uploads/dto/upload.dto'
import { ProviderRequestItemDto } from './providerRequestItem.dto'

export class ProviderRequestDto implements ProviderRequest {
    id: number
    userId: number
    horecaRequestId: number
    comment: string

    approvedByHoreca: boolean

    createdAt: Date
    updatedAt: Date

    items: ProviderRequestItemDto[]

    constructor(partial: Partial<ProviderRequest & { items: ProviderRequestItemDto[] }>) {
        Object.assign(this, partial)
    }
}
