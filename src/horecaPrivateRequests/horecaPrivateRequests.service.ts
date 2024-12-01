import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { ChatWsGateway } from '../chat/chat.ws.gateway'
import { HorecaRequestsService } from '../horecaRequests/services/horecaRequests.service'
import { ProviderRequestsService } from '../providerRequests/services/providerRequests.service'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { HorecaRequestCreatePrivateDto } from './dto/horecaRequest.create.private.dto'
import { HorecaPrivateRequestDto } from './dto/horecaPrivateRequests.dto'

@Injectable()
export class HorecaPrivateRequestsService {
    constructor(
        private horecaRequestsService: HorecaRequestsService,
        private providerRequestsService: ProviderRequestsService
    ) {}

    async create(auth: AuthInfoDto, { providerId, ...dto }: HorecaRequestCreatePrivateDto) {
        const horecaRequest = await this.horecaRequestsService.create(auth, dto)
        const providerRequest = await this.providerRequestsService.createByUser(
            { horecaRequestId: horecaRequest.id, comment: '', items: [] },
            providerId
        )

        const data = { providerRequestId: providerRequest.id, horecaRequestId: horecaRequest.id }
        await this.horecaRequestsService.approveProviderRequest(data)
        return new HorecaPrivateRequestDto(data)
    }
}
