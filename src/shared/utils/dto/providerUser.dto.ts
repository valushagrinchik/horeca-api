import { UploadDto } from '../../../uploads/dto/upload.dto'
import { Exclude, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { Validate, TypeValidate } from '../validation/validate.decotators'
import { $Enums, User } from '@prisma/client'

export class ProviderUserDto {
    name: string

    rating: number

    @Validate(TypeValidate.OBJECT, { required: false })
    @ValidateNested()
    @Type(() => UploadDto)
    avatar?: UploadDto

    categories?: string[]

    constructor(partial: Partial<ProviderUserDto & { avatar?: UploadDto; categories?: string[] }>) {
        Object.assign(this, partial)
    }
}
