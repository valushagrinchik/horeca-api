import { ProviderRequest, ProviderRequestStatus } from '@prisma/client'
import { ProviderRequestItemDto } from './providerRequestItem.dto'
import { HorecaRequestDto } from '../../horecaRequests/dto/horecaRequest.dto'
import { SourceWithUploads } from '../../uploads/dto/upload.dto'

export class ProviderRequestDto extends SourceWithUploads implements ProviderRequest {
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
        partial: Partial<ProviderRequest & { items: ProviderRequestItemDto[]; horecaRequest?: HorecaRequestDto } & SourceWithUploads>
    ) {
        super()
        Object.assign(this, partial)
    }
}
