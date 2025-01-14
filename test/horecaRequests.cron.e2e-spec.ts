import { INestApplication } from '@nestjs/common'
import { initApp } from './helpers'
import { HorecaRequestsService } from '../src/horecaRequests/services/horecaRequests.service'
import { DatabaseService } from '../src/system/database/database.service'
import * as dayjs from 'dayjs'
import { HorecaRequestStatus, ProviderRequestStatus } from '@prisma/client'

let app: INestApplication
let service: HorecaRequestsService
let db: DatabaseService

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        service = tm.get<HorecaRequestsService>(HorecaRequestsService)
        db = tm.get<DatabaseService>(DatabaseService)
    })
})

afterAll(async () => {
    await app.close()
})

describe('HorecaRequestsService', () => {
    it('should ...', async () => {
        const now = dayjs()
        await db.horecaRequest.createMany({
            data: [
                {
                    userId: 1,
                    address: '',
                    deliveryTime: now.add(2, 'days').toISOString(),
                    acceptUntill: now.add(2, 'hours').toISOString(),
                    paymentType: 'Prepayment',
                    name: 'No provider requests',
                    phone: '',
                },
                {
                    userId: 1,
                    address: '',
                    deliveryTime: now.add(2, 'days').toISOString(),
                    acceptUntill: now.add(1, 'day').toISOString(),
                    paymentType: 'Prepayment',
                    name: 'AcceptUntill tomorrow',
                    phone: '',
                },
            ],
        })
        await db.horecaRequest.create({
            data: {
                userId: 1,
                address: '',
                deliveryTime: now.add(2, 'days').toISOString(),
                acceptUntill: now.add(2, 'hours').toISOString(),
                paymentType: 'Prepayment',
                name: 'With provider requests',
                phone: '',
                providerRequests: {
                    createMany: {
                        data: [
                            {
                                userId: 2,
                            },
                        ],
                    },
                },
            },
        })
        await db.horecaRequest.create({
            data: {
                userId: 1,
                address: '',
                deliveryTime: now.toISOString(),
                acceptUntill: now.add(-2, 'days').toISOString(),
                paymentType: 'Prepayment',
                name: 'No choosen provider requests',
                status: HorecaRequestStatus.Pending,
                phone: '',
                providerRequests: {
                    createMany: {
                        data: [
                            {
                                userId: 2,
                                status: ProviderRequestStatus.Pending,
                            },
                        ],
                    },
                },
            },
        })
        await db.horecaRequest.create({
            data: {
                userId: 1,
                address: '',
                deliveryTime: now.toISOString(),
                acceptUntill: now.add(-2, 'days').toISOString(),
                paymentType: 'Prepayment',
                name: 'choosen provider requests',
                status: HorecaRequestStatus.Active,
                phone: '',
                providerRequests: {
                    createMany: {
                        data: [
                            {
                                userId: 2,
                                status: ProviderRequestStatus.Active,
                            },
                            {
                                userId: 3,
                                status: ProviderRequestStatus.Pending,
                            },
                        ],
                    },
                },
            },
        })
        const res = await service.pastRequests()
        const requests = await db.horecaRequest.findMany({ include: { providerRequests: true } })

        const noProviderRequestsRecord = requests.find(r => r.name == 'No provider requests')
        const acceptUntillTomorrowRecord = requests.find(r => r.name == 'AcceptUntill tomorrow')
        const withProviderRequestsRecord = requests.find(r => r.name == 'With provider requests')

        const noChoosenProviderRequestsRecord = requests.find(r => r.name == 'No choosen provider requests')
        const choosenProviderRequestsRecord = requests.find(r => r.name == 'choosen provider requests')

        expect(res).toBeTruthy()
        expect(noProviderRequestsRecord.status).toEqual(HorecaRequestStatus.CompletedUnsuccessfully)
        expect(acceptUntillTomorrowRecord.status).toEqual(HorecaRequestStatus.Pending)
        expect(withProviderRequestsRecord.status).toEqual(HorecaRequestStatus.Pending)

        expect(noChoosenProviderRequestsRecord.status).toEqual(HorecaRequestStatus.CompletedUnsuccessfully)
        expect(noChoosenProviderRequestsRecord.providerRequests[0].status).toEqual(ProviderRequestStatus.Canceled)

        expect(choosenProviderRequestsRecord.status).toEqual(HorecaRequestStatus.Active)
        expect(choosenProviderRequestsRecord.providerRequests[0].status).toEqual(ProviderRequestStatus.Finished)
        expect(choosenProviderRequestsRecord.providerRequests[1].status).toEqual(ProviderRequestStatus.Canceled)

        return
    })
})
