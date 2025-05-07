import { ProviderRequest, ProviderRequestItem } from '@prisma/client'
import { SourceWithUploads } from '../../uploads/dto/upload.dto'
import { Exclude } from 'class-transformer'
import { ApiHideProperty } from '@nestjs/swagger'

export class ProviderRequestItemDto extends SourceWithUploads implements ProviderRequestItem {
    id: number
    @ApiHideProperty()
    @Exclude()
    providerRequestId: number
    horecaRequestItemId: number
    available: boolean
    manufacturer: string
    cost: number
    createdAt: Date
    @ApiHideProperty()
    @Exclude()
    updatedAt: Date
    constructor(partial: Partial<ProviderRequest & SourceWithUploads>) {
        super()
        Object.assign(this, partial)
    }
}
