import { UploadDto } from '../../../uploads/dto/upload.dto'
import { Exclude, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { Validate, TypeValidate } from '../validation/validate.decotators'

export class ProviderUserDto {
    name: string

    rating: number

    @Exclude()
    password: string

    @Validate(TypeValidate.OBJECT, { required: false })
    @ValidateNested()
    @Type(() => UploadDto)
    avatar?: UploadDto

    constructor(partial: Partial<ProviderUserDto & { avatar?: UploadDto }>) {
        Object.assign(this, partial)
    }
}
