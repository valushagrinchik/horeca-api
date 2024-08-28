import { ValidateIf } from 'class-validator'
import { TypeValidate, Validate } from '../../../system/validation/validate.decotators'
import { Weekday } from '../../../system/enums'

export class Address {
    @Validate(TypeValidate.STRING, { required: false })
    id: number

    @Validate(TypeValidate.STRING)
    address: string

    @Validate(TypeValidate.ARRAY, { type: [Weekday], enum: Weekday, enumName: 'Weekday' })
    weekdays: Weekday[]

    // Monday
    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.mo))
    moFrom?: string

    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.mo))
    moTo?: string

    // Tuesday
    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.tu))
    tuFrom?: string

    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.tu))
    tuTo?: string

    // Wednesday
    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.we))
    weFrom?: string

    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.we))
    weTo?: string

    // Thursday
    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.th))
    thFrom?: string

    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.th))
    thTo?: string

    // Friday
    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.fr))
    frFrom?: string

    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.fr))
    frTo?: string

    // Saturday
    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.sa))
    saFrom?: string

    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.sa))
    saTo?: string

    // Sunday
    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.su))
    suFrom?: string

    @Validate(TypeValidate.STRING)
    @ValidateIf(o => Array.from(o.weekdays).includes(Weekday.su))
    suTo?: string
}
