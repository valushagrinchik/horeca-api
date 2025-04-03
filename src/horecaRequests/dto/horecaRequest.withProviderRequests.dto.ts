import { Exclude, Expose, Type } from 'class-transformer'
import { ProviderRequestDto } from '../../providerRequests/dto/providerRequest.dto'
import { HorecaRequestDto } from './horecaRequest.dto'
import { UploadDto } from '../../uploads/dto/upload.dto'
import { ValidateNested } from 'class-validator'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class HRProviderRequestDto extends ProviderRequestDto {
    cover: number

    @Exclude()
    user:  any

    @Validate(TypeValidate.OBJECT, {required: false})
    @ValidateNested()
    @Type(() => UploadDto)
    avatar?:  UploadDto

    constructor(partial: Partial<HRProviderRequestDto & { cover?: number, avatar?: UploadDto }>) {
        super(partial)
        Object.assign(this, partial)
    }
}


export class HorecaRequestWithProviderRequestDto extends HorecaRequestDto {
    providerRequests: HRProviderRequestDto[]

    constructor(partial: Partial<HorecaRequestDto & { providerRequests?: HRProviderRequestDto[] }>) {
        super(partial)
        Object.assign(this, partial)
    }
}
