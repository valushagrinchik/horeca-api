import {
    Chat,
    ChatMessage,
    ChatType,
    HorecaRequest,
    HorecaRequestStatus,
    PaymentType,
    ProviderRequest,
    ProviderRequestReview,
    ProviderRequestStatus,
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

export class ChatFullDto implements Chat {
    id: number
    @Validate(TypeValidate.ARRAY)
    opponents: number[]
    @ApiProperty({ enum: ChatType, enumName: 'ChatType' })
    type: ChatType

    providerRequest?: ChatProviderRequestDto
    messages: ChatMessageDto[]
    active: boolean

    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<Chat & { messages: ChatMessage[]; providerRequest: ProviderRequest }>) {
        Object.assign(this, partial)
    }
}
