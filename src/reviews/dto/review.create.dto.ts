import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

enum YesNoEnum {
    No = 0,
    Yes = 1,
}

export class ReviewCreateDto {
    @Validate(TypeValidate.NUMBER, { enum: YesNoEnum })
    isDelivered: number
    @Validate(TypeValidate.NUMBER, { enum: YesNoEnum })
    isSuccessfully: number
    providerRequestId: number
}
