import { TypeValidate, Validate } from '@/shared/utils'

export class SupportRequestCreateDto {
    @Validate(TypeValidate.STRING, { required: false })
    content?: string
}
