import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../system/database/database.service'
import { HorecaRequestStatus, Prisma, ProviderRequestStatus } from '@prisma/client'
import { HorecaRequestSetStatusDto } from '../dto/horecaRequest.approveProviderRequest.dto'
import * as dayjs from 'dayjs'
import { DB_DATE_FORMAT } from '../../system/utils/constants'

@Injectable()
export class HorecaRequestsDbService {
    constructor(private db: DatabaseService) {}

    getRawById = async (userId: number, id: number) => {
        return this.db.horecaRequest.findUnique({
            where: { id, userId },
        })
    }

    create = async (data: Prisma.HorecaRequestCreateInput) => {
        return this.db.horecaRequest.create({
            data,
        })
    }

    get = async (userId: number, id: number) => {
        return this.db.horecaRequest.findUnique({
            where: { id, userId },
            include: { items: true, providerRequests: { include: { items: true } } },
        })
    }

    findManyWithItems = async (args: Prisma.HorecaRequestFindManyArgs) => {
        return this.db.horecaRequest.findMany({ include: { items: true }, ...args })
    }

    count = async (args: Prisma.HorecaRequestCountArgs) => {
        return this.db.horecaRequest.count(args)
    }

    approveProviderRequest = async (dto: HorecaRequestSetStatusDto) => {
        return this.db.horecaRequest.update({
            where: {
                id: dto.horecaRequestId,
            },
            data: {
                providerRequests: {
                    update: {
                        where: {
                            id: dto.providerRequestId,
                        },
                        data: {
                            status: ProviderRequestStatus.Active,
                        },
                    },
                },
                status: HorecaRequestStatus.Active,
            },
        })
    }

    cancelProviderRequest = async (dto: HorecaRequestSetStatusDto) => {
        return this.db.horecaRequest.update({
            where: {
                id: dto.horecaRequestId,
            },
            data: {
                providerRequests: {
                    update: {
                        where: {
                            id: dto.providerRequestId,
                        },
                        data: {
                            status: ProviderRequestStatus.Canceled,
                        },
                    },
                },
                status: HorecaRequestStatus.Pending,
            },
        })
    }

    completePastRequests = async () => {
        const now = dayjs().format(DB_DATE_FORMAT)

        // CompletedUnsuccessfully
        await this.db.horecaRequest.updateMany({
            where: {
                OR: [
                    {
                        acceptUntill: { lt: now },
                        providerRequests: {
                            none: {},
                        },
                        status: {
                            in: [HorecaRequestStatus.Pending],
                        },
                    },
                    {
                        deliveryTime: { lt: now },
                        providerRequests: {
                            some: {},
                        },
                        status: {
                            in: [HorecaRequestStatus.Pending],
                        },
                    },
                ],
            },
            data: {
                status: HorecaRequestStatus.CompletedUnsuccessfully,
            },
        })

        // CompletedSuccessfully
        const data = await this.db.horecaRequest.findMany({
            where: {
                deliveryTime: { lt: now },
                providerRequests: {
                    some: {
                        status: ProviderRequestStatus.Active,
                    },
                },
                status: HorecaRequestStatus.Active,
            },
            include: {
                providerRequests: {
                    where: {
                        status: ProviderRequestStatus.Active,
                    },
                },
            },
        })

        const promises = data.map(record =>
            this.db.horecaRequest.update({
                where: { id: record.id },
                data: {
                    status: HorecaRequestStatus.CompletedSuccessfully,
                    providerRequests: {
                        updateMany: record.providerRequests.map(pRequest => ({
                            where: {
                                id: pRequest.id,
                            },
                            data: {
                                status: ProviderRequestStatus.Finished,
                            },
                        })),
                    },
                },
            })
        )

        await Promise.all(promises)
    }
}
