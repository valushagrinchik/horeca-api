import { TypeValidate, Validate } from '../../utils/validation/validate.decotators'
import { HorecaRequestCreateDto } from './horecaRequest.create.dto'

export class HorecaRequestTemplateCreateDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.OBJECT)
    content: HorecaRequestCreateDto
}
