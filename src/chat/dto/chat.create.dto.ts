import { TypeValidate, Validate } from "../../system/validation/validate.decotators";

export class ChatCreateDto {
    @Validate(TypeValidate.NUMBER)
    opponentId: number

    @Validate(TypeValidate.NUMBER, {required: false})
    orderId?: number
}