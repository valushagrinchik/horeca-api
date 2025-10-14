import { INestApplication } from '@nestjs/common'
import { 
    activateUser,
    initApp,
    registrateUser
} from './helpers/api'
import { HorecaRequestsService } from '../src/horecaRequests/services/horecaRequests.service'
import { DatabaseService } from '../src/system/database/database.service'
import { cleanDatabase } from './helpers/seed'
import { horecaUsers, providerUsers } from './mock/authData'
import { adminUserInput } from './mock/seedData'
import * as dayjs from 'dayjs'
import { HorecaRequestStatus, ProviderRequestStatus } from '@prisma/client'

let app: INestApplication
let service: HorecaRequestsService
let db: DatabaseService
let horecaUserId: number
let providerUserId: number
let adminUserId: number

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        service = tm.get<HorecaRequestsService>(HorecaRequestsService)
        db = tm.get<DatabaseService>(DatabaseService)
    })
})

beforeEach(async () => {
    try {
        await cleanDatabase(db)
        
        // Create users for the test
        const horecaUser = await registrateUser(app, horecaUsers[0])
        await activateUser(app, horecaUser.activationLink)
        horecaUserId = horecaUser.id
        
        const providerUser = await registrateUser(app, providerUsers[0])
        await activateUser(app, providerUser.activationLink)
        providerUserId = providerUser.id
        
        // Create admin user directly in database
        const adminUser = await db.user.create({
            data: adminUserInput
        })
        adminUserId = adminUser.id
    } catch (error) {
        console.error('Error in beforeEach setup:', error)
        throw error
    }
})

afterEach(async () => {
    try {
        await cleanDatabase(db)
    } catch (error) {
        console.error('Error in afterEach cleanup:', error)
    }
})

afterAll(async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (db) {
            await db.$disconnect()
        }
        if (app) {
            await app.close()
        }
    } catch (error) {
        console.error('Error during cleanup:', error)
    }
}, 10000)

describe('HorecaRequestsService', () => {
    it('should ...', async () => {
        const now = dayjs()
        await db.horecaRequest.createMany({
            data: [
                {
                    userId: horecaUserId,
                    address: '',
                    deliveryTime: now.add(2, 'days').toISOString(),
                    acceptUntill: now.add(2, 'hours').toISOString(),
                    paymentType: 'Prepayment',
                    name: 'No provider requests',
                    phone: '',
                },
                {
                    userId: horecaUserId,
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
                userId: horecaUserId,
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
                                userId: providerUserId,
                            },
                        ],
                    },
                },
            },
        })
        await db.horecaRequest.create({
            data: {
                userId: horecaUserId,
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
                                userId: providerUserId,
                                status: ProviderRequestStatus.Pending,
                            },
                        ],
                    },
                },
            },
        })
        await db.horecaRequest.create({
            data: {
                userId: horecaUserId,
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
                                userId: providerUserId,
                                status: ProviderRequestStatus.Active,
                            },
                            {
                                userId: adminUserId,
                                status: ProviderRequestStatus.Pending,
                            },
                        ],
                    },
                },
            },
        })
        const requestsBefore = await db.horecaRequest.findMany({ include: { providerRequests: true } })
        // console.log('----requests before cron initiate pastRequests', JSON.stringify(requestsBefore, null, 2))
        const res = await service.pastRequests()
        const requests = await db.horecaRequest.findMany({ include: { providerRequests: true } })
        // console.log('----requests after', JSON.stringify(requests, null, 2))

        const noProviderRequestsRecord = requests.find(r => r.name == 'No provider requests')
        const acceptUntillTomorrowRecord = requests.find(r => r.name == 'AcceptUntill tomorrow')
        const withProviderRequestsRecord = requests.find(r => r.name == 'With provider requests')

        const noChoosenProviderRequestsRecord = requests.find(r => r.name == 'No choosen provider requests')
        const choosenProviderRequestsRecord = requests.find(r => r.name == 'choosen provider requests')

        expect(res).toBeTruthy()
        expect(noProviderRequestsRecord.status).toEqual(HorecaRequestStatus.CompletedUnsuccessfully)
        expect(acceptUntillTomorrowRecord.status).toEqual(HorecaRequestStatus.Pending)
        expect(withProviderRequestsRecord.status).toEqual(HorecaRequestStatus.CompletedUnsuccessfully)

        expect(noChoosenProviderRequestsRecord.status).toEqual(HorecaRequestStatus.CompletedUnsuccessfully)
        expect(noChoosenProviderRequestsRecord.providerRequests[0].status).toEqual(ProviderRequestStatus.Canceled)

        expect(choosenProviderRequestsRecord.status).toEqual(HorecaRequestStatus.Active)
        expect(choosenProviderRequestsRecord.providerRequests[0].status).toEqual(ProviderRequestStatus.Finished)
        expect(choosenProviderRequestsRecord.providerRequests[1].status).toEqual(ProviderRequestStatus.Canceled)

        return
    })
})
