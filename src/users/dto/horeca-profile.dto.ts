import { TypeValidate, Validate } from 'src/utils/validation/validate.decotators'

export class Address {
    @Validate(TypeValidate.STRING)
    address: string

    // Monday
    @Validate(TypeValidate.STRING, { required: true })
    moFrom?: string

    @Validate(TypeValidate.STRING, { required: true })
    moTo?: string

    // Tuesday
    @Validate(TypeValidate.STRING, { required: true })
    tuFrom?: string

    @Validate(TypeValidate.STRING, { required: true })
    tuTo?: string

    // Wednesday
    @Validate(TypeValidate.STRING, { required: true })
    weFrom?: string

    @Validate(TypeValidate.STRING, { required: true })
    weTo?: string

    // Thursday
    @Validate(TypeValidate.STRING, { required: true })
    thFrom?: string

    @Validate(TypeValidate.STRING, { required: true })
    thTo?: string

    // Friday
    @Validate(TypeValidate.STRING, { required: true })
    frFrom?: string

    @Validate(TypeValidate.STRING, { required: true })
    frTo?: string

    // Saturday
    @Validate(TypeValidate.STRING, { required: true })
    saFrom?: string

    @Validate(TypeValidate.STRING, { required: true })
    saTo?: string

    // Sunday
    @Validate(TypeValidate.STRING, { required: true })
    suFrom?: string

    @Validate(TypeValidate.STRING, { required: true })
    suTo?: string
}

export class HorecaProfileDto {
    @Validate(TypeValidate.STRING)
    info: string

    @Validate(TypeValidate.OBJECT, { type: [Address] })
    addresses: Address[]
}
