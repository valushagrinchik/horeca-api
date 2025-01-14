import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../system/database/database.service'
import { HorecaRequestStatus, Prisma, ProviderRequestStatus } from '@prisma/client'
import { HorecaRequestSetStatusDto } from '../dto/horecaRequest.approveProviderRequest.dto'
import * as dayjs from 'dayjs'
import { DB_DATE_FORMAT } from '../../system/utils/constants'

@Injectable()
export class HorecaRequestsDbService {
    constructor(private db: DatabaseService) {}

    getRawById = async (id: number) => {
        return this.db.horecaRequest.findUnique({
            where: { id },
        })
    }

    create = async (data: Prisma.HorecaRequestCreateInput) => {
        return this.db.horecaRequest.create({
            data,
        })
    }

    update = async (args: Prisma.HorecaRequestUpdateArgs) => {
        return this.db.horecaRequest.update(args)
    }

    get = async (
        id: number,
        include: Prisma.HorecaRequestInclude = { items: true, providerRequests: { include: { items: true } } }
    ) => {
        return this.db.horecaRequest.findUnique({
            where: { id },
            include,
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
            include: {
                providerRequests: {
                    where: {
                        id: dto.providerRequestId,
                    },
                },
            },
        })
    }

    cancel = async (id: number) => {
        return this.db.horecaRequest.update({
            where: {
                id,
            },
            data: {
                providerRequests: {
                    updateMany: {
                        where: {
                            status: { in: [ProviderRequestStatus.Pending, ProviderRequestStatus.Active] },
                        },
                        data: {
                            status: ProviderRequestStatus.Canceled,
                        },
                    },
                },
                status: HorecaRequestStatus.CompletedUnsuccessfully,
            },
        })
    }

    pastHorecaRequestsWithoutProviderOnes = async (now = dayjs().toISOString()) => {
        const withoutProviderRequests = await this.db.horecaRequest.findMany({
            where: {
                acceptUntill: { lte: now },
                providerRequests: {
                    none: {},
                },
                status: {
                    in: [HorecaRequestStatus.Pending],
                },
            },
        })

        const promises = withoutProviderRequests.map(record =>
            this.db.horecaRequest.update({
                where: { id: record.id },
                data: {
                    status: HorecaRequestStatus.CompletedUnsuccessfully,
                },
            })
        )

        await Promise.all(promises)
        return withoutProviderRequests
    }

    async pastHorecaRequestsSetStatuses(
        hrStatusFrom: HorecaRequestStatus,
        hrStatusTo: HorecaRequestStatus,
        prStatusFrom: ProviderRequestStatus,
        prStatusTo: ProviderRequestStatus,
        now = dayjs().toISOString()
    ) {
        const data = await this.db.horecaRequest.findMany({
            where: {
                deliveryTime: { lte: now },
                status: hrStatusFrom,
            },
            include: {
                providerRequests: {
                    where: {
                        status: prStatusFrom,
                    },
                },
            },
        })

        const promises = data.map(record =>
            this.db.horecaRequest.update({
                where: { id: record.id },
                data: {
                    status: hrStatusTo,
                    providerRequests: {
                        updateMany: record.providerRequests.map(pRequest => ({
                            where: {
                                id: pRequest.id,
                            },
                            data: {
                                status: prStatusTo,
                            },
                        })),
                    },
                },
            })
        )

        await Promise.all(promises)
    }

    async findAllForReview() {
        const hours24Ago = dayjs().add(-1, 'day').toDate()

        return this.db.horecaRequest.findMany({
            where: {
                status: HorecaRequestStatus.Active,
                reviewNotificationSent: false,
                deliveryTime: { lt: hours24Ago },
            },
            include: {
                providerRequests: {
                    where: {
                        status: ProviderRequestStatus.Finished,
                    },
                },
            },
        })
    }

    async findAllForReviewSecondNotification() {
        // 48 hours after first notification
        const hours72Ago = dayjs().add(-3, 'day').toDate()

        return this.db.horecaRequest.findMany({
            where: {
                status: HorecaRequestStatus.Active,
                reviewNotificationSent: true,
                providerRequests: {
                    some: {
                        status: ProviderRequestStatus.Finished,
                        providerRequestReview: {
                            is: null,
                        },
                    },
                },
                deliveryTime: { lt: hours72Ago },
            },
            include: {
                providerRequests: {
                    where: {
                        status: ProviderRequestStatus.Finished,
                    },
                },
            },
        })
    }
}
