import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../system/database/database.service'
import { HorecaRequest, HorecaRequestItem, HorecaRequestProviderStatus, Prisma, ProfileType } from '@prisma/client'

@Injectable()
export class RequestsMatcherDbService {
    constructor(
        private db: DatabaseService
    ) { }

    updateView = async () => {
        await this.db.$queryRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY provider_horeca_requests_cover_view;`
    }

    findHorecaRequests = async (
        args: Prisma.ProviderHorecaRequestsCoverViewFindManyArgs
    ): Promise<
        {
            cover: number
            horecaRequest: HorecaRequest & {
                items?: HorecaRequestItem[]
                horecaRequestProviderStatus?: HorecaRequestProviderStatus
            }
        }[]
    > => {
        return this.db.providerHorecaRequestsCoverView.findMany({
            // should be overwritten in args
            include: {
                horecaRequest: {
                    include: {
                        items: true,
                        horecaRequestProviderStatus: true,
                    },
                },
            },
            ...args,
        })
    }

    countHorecaRequests = async (where: Prisma.ProviderHorecaRequestsCoverViewWhereInput) => {
        return this.db.providerHorecaRequestsCoverView.count({ where })
    }
}
