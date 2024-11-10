import { SupportRequest, SupportRequestStatus } from '@prisma/client'

export class SupportRequestDto implements SupportRequest {
    id: number
    userId: number
    content: string | null

    status: SupportRequestStatus

    adminId: number | null

    chatId: number

    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<SupportRequest>) {
        Object.assign(this, partial)
    }
}
