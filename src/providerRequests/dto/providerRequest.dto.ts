import { ProviderRequest } from '@prisma/client'
import { ProviderRequestItemDto } from './providerRequestItem.dto'

export class ProviderRequestDto implements ProviderRequest {
    id: number
    userId: number
    horecaRequestId: number
    comment: string

    createdAt: Date
    updatedAt: Date

    items: ProviderRequestItemDto[]

    constructor(partial: Partial<ProviderRequest & { items: ProviderRequestItemDto[] }>) {
        Object.assign(this, partial)
    }
}
