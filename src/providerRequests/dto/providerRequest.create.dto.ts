import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { TypeValidate, Validate } from '@/shared/utils'
import { ProviderRequestItemCreateDto } from './providerRequest.item.create.dto'

export class ProviderRequestCreateDto {
    @Validate(TypeValidate.NUMBER)
    horecaRequestId: number

    @Validate(TypeValidate.STRING, { required: false })
    comment: string

    @Validate(TypeValidate.ARRAY, { minItems: 1 })
    @ValidateNested()
    @Type(() => ProviderRequestItemCreateDto)
    items: ProviderRequestItemCreateDto[]
}
