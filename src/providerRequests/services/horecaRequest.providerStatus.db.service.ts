import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../system/database/database.service'
import { HorecaRequestProviderStatusDto } from '../dto/horecaRequest.providerStatus.dto'

@Injectable()
export class HorecaRequestProviderStatusDbService {
    constructor(private prisma: DatabaseService) {}

    async upsert(data: HorecaRequestProviderStatusDto & { providerId: number }) {
        return this.prisma.horecaRequestProviderStatus.upsert({
            where: {
                horecaRequestId: data.horecaRequestId,
                providerId: data.providerId,
            },
            create: data,
            update: data,
        })
    }
}
