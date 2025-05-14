import { SupportRequestStatus } from '@prisma/client'
import { TypeValidate, Validate, ValidateEnum } from '@/shared/utils'

export class SupportRequestSearchDto {
    @ValidateEnum(SupportRequestStatus, { enum: SupportRequestStatus, enumName: 'SupportRequestStatus' })
    status: SupportRequestStatus

    @Validate(TypeValidate.BOOLEAN, { required: false })
    isNew?: boolean
}
