import {
    Chat,
    ChatMessage,
    ChatType,
    HorecaFavourites,
    HorecaRequest,
    HorecaRequestStatus,
    PaymentType,
    ProviderRequest,
    ProviderRequestReview,
    ProviderRequestStatus,
    SupportRequest,
    SupportRequestStatus,
} from '@prisma/client'
import { ChatMessageDto } from './chat.message.dto'
import { ApiProperty } from '@nestjs/swagger'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class ChatProviderRequestReviewDto implements ProviderRequestReview {
    id: number
    userId: number
    isDelivered: number
    isSuccessfully: number
    providerRequestId: number
    createdAt: Date
    updatedAt: Date
    constructor(partial: Partial<ProviderRequestReview>) {
        Object.assign(this, partial)
    }
}

export class ChatHorecaRequestDto implements HorecaRequest {
    id: number
    userId: number
    address: string
    deliveryTime: Date
    acceptUntill: Date
    @ApiProperty({ enum: PaymentType, enumName: 'PaymentType' })
    paymentType: PaymentType
    comment: string
    name: string
    phone: string
    reviewNotificationSent: boolean
    @ApiProperty({ enum: HorecaRequestStatus, enumName: 'HorecaRequestStatus' })
    status: HorecaRequestStatus
    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<HorecaRequest>) {
        Object.assign(this, partial)
    }
}

export class ChatProviderRequestDto implements ProviderRequest {
    id: number
    comment: string
    userId: number
    horecaRequestId: number
    @ApiProperty({ enum: ProviderRequestStatus, enumName: 'ProviderRequestStatus' })
    status: ProviderRequestStatus
    chatId: number

    providerRequestReview?: ChatProviderRequestReviewDto
    horecaRequest: ChatHorecaRequestDto

    createdAt: Date
    updatedAt: Date

    constructor(
        partial: Partial<
            ProviderRequest & { providerRequestReview: ProviderRequestReview; horecaRequest: HorecaRequest }
        >
    ) {
        Object.assign(this, partial)
    }
}
export class ChatHorecaFavouritesDto implements HorecaFavourites {
    id: number
    userId: number
    providerId: number
    chatId: number
    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<HorecaFavourites>) {
        Object.assign(this, partial)
    }
}

export class ChatSupportRequestDto implements SupportRequest {
    id: number
    userId: number
    content: string
    @ApiProperty({ enum: SupportRequestStatus, enumName: 'SupportRequestStatus' })
    status: SupportRequestStatus
    adminId: number
    chatId: number
    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<SupportRequest>) {
        Object.assign(this, partial)
    }
}

export class ChatFullDto implements Chat {
    id: number
    @Validate(TypeValidate.ARRAY)
    opponents: number[]
    @ApiProperty({ enum: ChatType, enumName: 'ChatType' })
    type: ChatType

    providerRequest?: ChatProviderRequestDto
    horecaFavourites?: ChatHorecaFavouritesDto
    supportRequest?: ChatSupportRequestDto
    messages: ChatMessageDto[]

    createdAt: Date
    updatedAt: Date

    get isChattable(): Boolean {
        return (
            (this.type === ChatType.Order && this.providerRequest?.status == ProviderRequestStatus.Active) ||
            (this.type === ChatType.Private && !!this.horecaFavourites) ||
            (this.type === ChatType.Support && this.supportRequest?.status == SupportRequestStatus.Active)
        )
    }

    constructor(
        partial: Partial<
            Chat & {
                messages: ChatMessage[]
                providerRequest: ProviderRequest
                horecaFavourites: HorecaFavourites
                supportRequest: SupportRequest
            }
        >
    ) {
        Object.assign(this, partial)
    }
}
