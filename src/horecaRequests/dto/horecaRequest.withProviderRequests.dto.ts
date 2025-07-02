import { Exclude, Type } from 'class-transformer'
import { HorecaRequestDto } from './horecaRequest.dto'
import { SourceWithUploads, UploadDto } from '../../uploads/dto/upload.dto'
import { ValidateNested } from 'class-validator'
import { ProviderUserDto, TypeValidate, Validate } from '@/shared/utils'
import {
    HorecaRequest,
    HorecaRequestItem,
    HorecaRequestProviderStatus,
    ProviderRequest,
    ProviderRequestItem,
    ProviderRequestStatus,
} from '@prisma/client'
import { ApiHideProperty } from '@nestjs/swagger'

export class IncomeProviderRequestItemDto extends SourceWithUploads implements ProviderRequestItem {
    id: number
    @ApiHideProperty()
    @Exclude()
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

export class IncomeProviderRequestDto implements ProviderRequest {
    id: number
    comment: string
    @ApiHideProperty()
    @Exclude()
    userId: number
    @ApiHideProperty()
    @Exclude()
    horecaRequestId: number
    status: ProviderRequestStatus
    chatId: number
    createdAt: Date
    updatedAt: Date

    @ValidateNested({ each: true })
    items: IncomeProviderRequestItemDto[]

    cover: number
    user: ProviderUserDto

    constructor(
        p: Partial<ProviderRequest & { items: ProviderRequestItem[]; cover: number; user: ProviderUserDto }>,
        providerRequestItemsImages: Record<string, UploadDto[]>
    ) {
        Object.assign(this, p)
        this.items = p.items.map(item => {
            return new IncomeProviderRequestItemDto({ ...item, images: providerRequestItemsImages[item.id] })
        })
    }
}

export class HorecaRequestWithProviderRequestsDto extends HorecaRequestDto {
    providerRequests: IncomeProviderRequestDto[]

    constructor(
        h: Partial<
            HorecaRequest & {
                items?: HorecaRequestItem[]
                horecaRequestProviderStatus?: HorecaRequestProviderStatus
                providerRequests?: ProviderRequest[]
            } & SourceWithUploads
        >,
        providerRequestsImages: Record<string, UploadDto[]>,
        providerProfilesImage: Record<string, UploadDto[]>
    ) {
        super(h)
        this.providerRequests = h.providerRequests.map(
            (pR: ProviderRequest & { items: ProviderRequestItem[]; user: any }) => {
                return new IncomeProviderRequestDto(
                    {
                        ...pR,
                        user: {
                            ...pR.user,
                            avatar: (providerProfilesImage[pR.user.profile?.id] || [])[0],
                        },
                        cover: Math.round((pR.items.length / h.items.length) * 100),
                    },
                    providerRequestsImages
                )
            }
        )
    }
}
