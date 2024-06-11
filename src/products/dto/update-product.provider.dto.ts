import { TypeValidate, Validate } from "src/utils/validation/validate.decotators"
import { CreateProductProviderDto } from "./create-product.provider.dto"
import { ProductPackagingType } from "@prisma/client"

export class UpdateProductProviderDto extends CreateProductProviderDto {
    @Validate(TypeValidate.STRING, {required: false})
    category: string

    @Validate(TypeValidate.STRING, {required: false})
    name: string

    @Validate(TypeValidate.STRING, {required: false})
    description: string

    @Validate(TypeValidate.STRING, {required: false})
    producer: string

    @Validate(TypeValidate.NUMBER, {required: false})
    cost: number

    @Validate(TypeValidate.NUMBER, {required: false})
    count: number

    @Validate(TypeValidate.STRING, {required: false})
    packagingType: ProductPackagingType
}