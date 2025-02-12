import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../database/database.service'
import { Prisma } from '@prisma/client'

@Injectable()
export class RequestsMatcherDbService {
    constructor(private db: DatabaseService) {}

    updateView = async () => {
        await this.db.$queryRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY provider_horeca_requests_cover_view;`
    }

    findHorecaRequests = async (args: Prisma.ProviderHorecaRequestsCoverViewFindManyArgs): Promise<any> => {
        return this.db.providerHorecaRequestsCoverView.findMany(args)
    }

    countHorecaRequests = async (where: Prisma.ProviderHorecaRequestsCoverViewWhereInput) => {
        return this.db.providerHorecaRequestsCoverView.count({ where })
    }
}
