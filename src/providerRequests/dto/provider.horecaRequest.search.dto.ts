import { Categories } from '../../system/utils/enums'
import { ValidateEnum } from '../../system/utils/validation/validate.decotators'

export enum ProviderHorecaRequestStatus {
    All = 'All',
    Actual = 'Actual',
    Hidden = 'Hidden',
}
export class ProviderHorecaRequestSearchDto {
    @ValidateEnum(ProviderHorecaRequestStatus, {
        enum: ProviderHorecaRequestStatus,
        enumName: 'ProviderHorecaRequestStatus',
    })
    status?: ProviderHorecaRequestStatus

    @ValidateEnum(Categories, { enum: Categories, enumName: 'Categories' })
    category?: Categories
}
