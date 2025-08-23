import { UploadDto } from '../../../uploads/dto/upload.dto'
import { Exclude, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { Validate, TypeValidate } from '../validation/validate.decotators'
import { ApiHideProperty } from '@nestjs/swagger'

export class ProviderUserDto {
    id: number
    name: string

    rating: number

    @ApiHideProperty()
    @Exclude()
    profile: any

    @Validate(TypeValidate.OBJECT, { required: false })
    @ValidateNested()
    @Type(() => UploadDto)
    avatar?: UploadDto

    categories?: string[]

    constructor(partial: Partial<ProviderUserDto & { avatar?: UploadDto; categories?: string[] }>) {
        Object.assign(this, partial)
    }
}
