import { ChatType } from '@prisma/client'
import { ValidateEnum } from '@/shared/utils'

export class ChatSearchDto {
    @ValidateEnum(ChatType, { enum: ChatType, enumName: 'ChatType' })
    type: ChatType
}
