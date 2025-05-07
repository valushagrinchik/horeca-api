import { HorecaRequest, ProviderRequest, ProviderRequestItem, ProviderRequestStatus } from '@prisma/client'
import { ProviderRequestItemDto } from './providerRequestItem.dto'
import { UploadDto } from '../../uploads/dto/upload.dto'
import { IncomeHorecaRequestDto } from './incomeHorecaRequest.dto'

export class ProviderRequestDto implements ProviderRequest {
    id: number
    comment: string
    userId: number
    horecaRequestId: number
    status: ProviderRequestStatus
    chatId: number
    createdAt: Date
    updatedAt: Date

    items: ProviderRequestItemDto[]
    horecaRequest?: IncomeHorecaRequestDto

    constructor(
        p: Partial<ProviderRequest & { items: ProviderRequestItem[]; horecaRequest?: HorecaRequest }>,
        providerRequestItemsImages: Record<string, UploadDto[]>
    ) {
        Object.assign(this, p)
        this.items = (p.items || []).map(item => {
            return new ProviderRequestItemDto({ ...item, images: providerRequestItemsImages[item.id] })
        })
        this.horecaRequest = new IncomeHorecaRequestDto(p.horecaRequest)
    }
}
