import { $Enums, HorecaRequest } from '@prisma/client'

export class IncomeHorecaRequestDto implements HorecaRequest {
    id: number
    userId: number
    categories: string[]
    address: string
    deliveryTime: Date
    acceptUntill: Date
    paymentType: $Enums.PaymentType
    comment: string
    name: string
    phone: string
    reviewNotificationSent: boolean
    status: $Enums.HorecaRequestStatus
    createdAt: Date
    updatedAt: Date

    cover?: number

    constructor(partial: Partial<HorecaRequest & { cover?: number }>) {
        Object.assign(this, partial)
    }
}
