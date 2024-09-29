import { ChatType } from '@prisma/client'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class ChatDeactivateDto {
    @Validate(TypeValidate.NUMBER)
    sourceId: number
    @Validate(TypeValidate.STRING, { enum: ChatType })
    type: ChatType
}
