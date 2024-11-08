import { HorecaRequestStatus } from '@prisma/client'
import { ValidateEnum } from '../../system/utils/validation/validate.decotators'

export class HorecaRequestSearchDto {
    @ValidateEnum(HorecaRequestStatus, { enum: HorecaRequestStatus, enumName: 'HorecaRequestStatus' })
    status: HorecaRequestStatus
}
