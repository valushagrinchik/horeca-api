import { HorecaRequestUpdateDto } from './horecaRequest.update.dto'
import { Validate, TypeValidate } from '../../system/utils/validation/validate.decotators'

export class HorecaRequestTemplateUpdateDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.OBJECT)
    content: HorecaRequestUpdateDto
}
