import { INestApplication } from '@nestjs/common'
import {
    activateUser,
    authUser,
    createHorecaRequest,
    createProviderRequest,
    findAllHorecaRequest,
    getHorecaRequest,
    initApp,
    registrateUser,
} from './helpers/api'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from '../src/auth/dto/auth.result.dto'
import { horecaRequestInput } from './mock/seedData'
import { horecaUsers, providerUsers } from './mock/authData'
import { DatabaseService } from '@/system/database/database.service'
import { cleanDatabase } from './helpers/seed'
import { RequestsMatcherDbService } from '@/shared/requestsMatcher/requestsMatcher.db.service'

let app: INestApplication
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let createdRequestId: number
let db: DatabaseService
let matcher: RequestsMatcherDbService

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        db = tm.get<DatabaseService>(DatabaseService)
        matcher = tm.get<RequestsMatcherDbService>(RequestsMatcherDbService)
    })
})

beforeEach(async () => {
    try {
        await cleanDatabase(db)
        
        // Create and activate horeca user
        const horecaUser = await registrateUser(app, horecaUsers[0])
        await activateUser(app, horecaUser.activationLink)
        horecaAuth = await authUser(app, {
            email: horecaUsers[0].email,
            password: horecaUsers[0].password
        })
        
        // Create and activate provider user  
        const providerUser = await registrateUser(app, providerUsers[0])
        await activateUser(app, providerUser.activationLink)
        providerAuth = await authUser(app, {
            email: providerUsers[0].email,
            password: providerUsers[0].password
        })
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

describe('HorecaRequestsController (e2e)', () => {
    describe('POST ' + ENDPOINTS.HOREKA_REQUESTS, () => {
        it('should return just created request data', async () => {
            const res = await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput)

            createdRequestId = res.id

            expect(res).toHaveProperty('id')
            expect(res.items.length).toBe(horecaRequestInput.items.length)
            return
        })
    })

    describe('GET ' + ENDPOINTS.HOREKA_REQUEST, () => {
        it('should return request data', async () => {
            const createdHorecaRequest = await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput)
            const createdProviderRequest = await createProviderRequest(app, providerAuth.accessToken, {
                horecaRequestId: createdHorecaRequest.id,
                comment: 'super',
                items: createdHorecaRequest.items.map(item => ({
                    available: true,
                    manufacturer: 'smb',
                    cost: 3000,
                    horecaRequestItemId: item.id,
                })),
            })

            await matcher.updateView()

            const res = await getHorecaRequest(app, horecaAuth.accessToken, createdHorecaRequest.id)

            expect(res.id).toBe(createdHorecaRequest.id)
            expect(res).toHaveProperty('items')
            expect(res).toHaveProperty('providerRequests')
            expect(res.providerRequests.length).toBe(1)
            expect(res.providerRequests[0]).toHaveProperty('cover')
            expect(res.providerRequests[0].cover).toBe(100)

            expect(res.items.length).toBe(horecaRequestInput.items.length)
            return
        })
    })

    describe('GET ' + ENDPOINTS.HOREKA_REQUESTS, () => {
        it('should return array of requests', async () => {
            // Create a horeca request first
            await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput)
            
            const res = await findAllHorecaRequest(app, horecaAuth.accessToken)

            expect(res).toHaveProperty('data')
            expect(res).toHaveProperty('total')

            expect(res.data.length).toBeGreaterThan(0)
            expect(res.data[0]).toHaveProperty('items')
            return
        })
    })
})
