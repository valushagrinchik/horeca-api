import { ChatType } from '@prisma/client'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class ChatSearchDto {
    @Validate(TypeValidate.STRING, { enum: ChatType })
    type: ChatType
}
