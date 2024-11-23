import { ProviderRequest, ProviderRequestStatus } from '@prisma/client'
import { ProviderRequestItemDto } from './providerRequestItem.dto'
import { HorecaRequestDto } from 'src/horecaRequests/dto/horecaRequest.dto'

export class ProviderRequestDto implements ProviderRequest {
    id: number
    userId: number
    horecaRequest?: HorecaRequestDto
    horecaRequestId: number
    comment: string

    createdAt: Date
    updatedAt: Date

    chatId: number | null

    items: ProviderRequestItemDto[]

    status: ProviderRequestStatus

    constructor(
        partial: Partial<ProviderRequest & { items: ProviderRequestItemDto[]; horecaRequest?: HorecaRequestDto }>
    ) {
        Object.assign(this, partial)
    }
}
