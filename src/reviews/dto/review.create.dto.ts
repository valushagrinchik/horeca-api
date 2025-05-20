import { TypeValidate, Validate } from '@/shared/utils'

enum YesNoEnum {
    No = 0,
    Yes = 1,
}

export class ReviewCreateDto {
    @Validate(TypeValidate.NUMBER, { enum: YesNoEnum })
    isDelivered: number
    @Validate(TypeValidate.NUMBER, { enum: YesNoEnum })
    isSuccessfully: number
    @Validate(TypeValidate.NUMBER)
    providerRequestId: number
}
