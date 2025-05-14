import { HorecaRequestUpdateDto } from './horecaRequest.update.dto'
import { Validate, TypeValidate } from '@/shared/utils'

export class HorecaRequestTemplateUpdateDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.OBJECT)
    content: HorecaRequestUpdateDto
}
