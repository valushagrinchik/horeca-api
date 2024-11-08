import { ProviderRequestStatus } from '@prisma/client'
import { ValidateEnum } from '../../system/utils/validation/validate.decotators'

export class ProviderRequestSearchDto {
    @ValidateEnum(ProviderRequestStatus, { enum: ProviderRequestStatus, enumName: 'ProviderRequestStatus' })
    status: ProviderRequestStatus
}
