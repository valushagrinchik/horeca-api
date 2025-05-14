import { TypeValidate, Validate } from '@/shared/utils'
import { HorecaRequestCreateDto } from './horecaRequest.create.dto'

export class HorecaRequestTemplateCreateDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.OBJECT)
    content: HorecaRequestCreateDto
}
