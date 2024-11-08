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

    update = async (args: Prisma.HorecaRequestUpdateArgs) => {
        return this.db.horecaRequest.update(args)
    }

    get = async (
        userId: number,
        id: number,
        include: Prisma.HorecaRequestInclude = { items: true, providerRequests: { include: { items: true } } }
    ) => {
        return this.db.horecaRequest.findUnique({
            where: { id, userId },
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
        })
    }

    pastRequests = async () => {
        const now = dayjs().format(DB_DATE_FORMAT)

        // CompletedUnsuccessfully
        // no provider requests untill acceptUntill passed
        // set horecaRequest.status to CompletedUnsuccessfully
        await this.db.horecaRequest.updateMany({
            where: {
                acceptUntill: { lt: now },
                providerRequests: {
                    none: {},
                },
                status: {
                    in: [HorecaRequestStatus.Pending],
                },
            },
            data: {
                status: HorecaRequestStatus.CompletedUnsuccessfully,
            },
        })

        // No сhosen provider request until deliveryTime passed
        // set horecaRequest.status to CompletedUnsuccessfully
        // set providerRequest.status to Canceled
        await this.pastHorecaRequestsSetStatusTo(
            HorecaRequestStatus.Pending,
            HorecaRequestStatus.CompletedUnsuccessfully,
            ProviderRequestStatus.Pending,
            ProviderRequestStatus.Canceled,
            now
        )

        // Chosen provider request, deliveryTime passed
        // set horecaRequest.status to Finished
        // set providerRequest.status to Finished for chosen one and Canceled for others
        await this.pastHorecaRequestsSetStatusTo(
            HorecaRequestStatus.Active,
            HorecaRequestStatus.Finished,
            ProviderRequestStatus.Active,
            ProviderRequestStatus.Finished,
            now
        )
        await this.pastHorecaRequestsSetStatusTo(
            HorecaRequestStatus.Active,
            HorecaRequestStatus.Finished,
            ProviderRequestStatus.Pending,
            ProviderRequestStatus.Canceled,
            now
        )
    }

    async pastHorecaRequestsSetStatusTo(
        hrStatusFrom: HorecaRequestStatus,
        hrStatusTo: HorecaRequestStatus,
        prStatusFrom: ProviderRequestStatus,
        prStatusTo: ProviderRequestStatus,
        now = dayjs().format(DB_DATE_FORMAT)
    ) {
        const data = await this.db.horecaRequest.findMany({
            where: {
                deliveryTime: { lt: now },
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
                status: ProviderRequestStatus.Finished,
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
                status: ProviderRequestStatus.Finished,
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
