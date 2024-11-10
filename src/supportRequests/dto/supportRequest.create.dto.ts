import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class SupportRequestCreateDto {
    @Validate(TypeValidate.STRING, { required: false })
    content?: string
}
