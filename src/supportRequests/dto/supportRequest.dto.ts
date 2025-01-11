import { SupportRequest, SupportRequestStatus } from '@prisma/client'
import { ValidateEnum } from '../../system/utils/validation/validate.decotators'

export class SupportRequestDto implements SupportRequest {
    id: number
    userId: number
    content: string | null

    @ValidateEnum(SupportRequestStatus, { enum: SupportRequestStatus, enumName: 'SupportRequestStatus' })
    status: SupportRequestStatus

    adminId: number | null

    chatId: number

    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<SupportRequest>) {
        Object.assign(this, partial)
    }
}
