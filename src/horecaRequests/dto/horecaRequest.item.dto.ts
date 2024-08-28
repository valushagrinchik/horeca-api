import { HorecaRequestItem } from '@prisma/client'

export class HorecaRequestItemDto implements HorecaRequestItem {
    id: number
    horecaRequestId: number
    name: string
    amount: number
    unit: string
    category: string
    createdAt: Date
    updatedAt: Date
    constructor(partial: Partial<HorecaRequestItem>) {
        Object.assign(this, partial)
    }
}
