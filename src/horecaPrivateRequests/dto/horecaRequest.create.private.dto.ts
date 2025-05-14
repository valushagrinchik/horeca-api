import { HorecaRequestCreateDto } from '../../horecaRequests/dto/horecaRequest.create.dto'
import { TypeValidate, Validate } from '@/shared/utils'

export class HorecaRequestCreatePrivateDto extends HorecaRequestCreateDto {
    @Validate(TypeValidate.NUMBER)
    providerId: number
}
