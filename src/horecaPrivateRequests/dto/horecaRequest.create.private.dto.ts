import { HorecaRequestCreateDto } from '../../horecaRequests/dto/horecaRequest.create.dto'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class HorecaRequestCreatePrivateDto extends HorecaRequestCreateDto {
    @Validate(TypeValidate.NUMBER)
    providerId: number
}
