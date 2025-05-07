import { HorecaRequestDto } from './horecaRequest.dto'
import { SourceWithUploads } from '../../uploads/dto/upload.dto'

import {
    $Enums,
    HorecaRequest,
    HorecaRequestItem,
    HorecaRequestProviderStatus,
    ProviderRequest,
    ProviderRequestItem,
} from '@prisma/client'

export class ActiveProviderRequestDto implements ProviderRequest {
    id: number
    comment: string
    userId: number
    horecaRequestId: number
    status: $Enums.ProviderRequestStatus
    chatId: number
    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<ProviderRequest>) {
        Object.assign(this, partial)
    }
}

export class HorecaRequestWithActiveProviderRequestDto extends HorecaRequestDto {
    providerRequests: ActiveProviderRequestDto[]

    constructor(
        h: Partial<
            HorecaRequest & {
                items?: HorecaRequestItem[]
                horecaRequestProviderStatus?: HorecaRequestProviderStatus
                providerRequests?: ProviderRequest[]
            } & SourceWithUploads
        >
    ) {
        super(h)
        this.providerRequests = (h.providerRequests || []).map(pR => {
            return new ActiveProviderRequestDto({
                ...pR,
            })
        })
    }
}
