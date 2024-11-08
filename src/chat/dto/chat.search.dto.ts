import { ChatType } from '@prisma/client'
import { TypeValidate, Validate, ValidateEnum } from '../../system/utils/validation/validate.decotators'

export class ChatSearchDto {
    @ValidateEnum(ChatType, { enum: ChatType, enumName: 'ChatType' })
    type: ChatType
}
