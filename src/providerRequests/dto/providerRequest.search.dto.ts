import { ProviderRequestStatus } from '@prisma/client'
import { ValidateEnum } from '@/shared/utils'

export class ProviderRequestSearchDto {
    @ValidateEnum(ProviderRequestStatus, { enum: ProviderRequestStatus, enumName: 'ProviderRequestStatus' })
    status: ProviderRequestStatus
}
