import { HorecaRequestStatus } from '@prisma/client'
import { ValidateEnum } from '@/shared/utils'

export class HorecaRequestSearchDto {
    @ValidateEnum(HorecaRequestStatus, { enum: HorecaRequestStatus, enumName: 'HorecaRequestStatus' })
    status: HorecaRequestStatus
}
