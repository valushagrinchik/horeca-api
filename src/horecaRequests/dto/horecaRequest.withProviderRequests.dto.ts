import { ProviderRequestDto } from '../../providerRequests/dto/providerRequest.dto'
import { HorecaRequestDto } from './horecaRequest.dto'

class HRProviderRequestDto extends ProviderRequestDto {
    cover: number
}

export class HorecaRequestWithProviderRequestDto extends HorecaRequestDto {
    providerRequests: HRProviderRequestDto[]

    constructor(partial: Partial<HorecaRequestDto & { providerRequests?: HRProviderRequestDto[] }>) {
        super(partial)
        Object.assign(this, partial)
    }
}
