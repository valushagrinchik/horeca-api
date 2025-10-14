import { INestApplication } from '@nestjs/common'
import { 
    activateUser,
    authUser, 
    createSupportRequest, 
    getAdminSupportRequests, 
    getUsersSupportRequests, 
    initApp,
    registrateUser
} from './helpers/api'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from '../src/auth/dto/auth.result.dto'
import { adminUserInput } from './mock/seedData'
import { horecaUsers, providerUsers } from './mock/authData'
import { SupportRequestStatus } from '@prisma/client'
import { DatabaseService } from '@/system/database/database.service'
import { cleanDatabase } from './helpers/seed'

let app: INestApplication
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let adminAuth: AuthResultDto
let db: DatabaseService

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        db = tm.get<DatabaseService>(DatabaseService)
    })
})

beforeEach(async () => {
    try {
        await cleanDatabase(db)
        
        // Create admin user in database first
        await db.user.create({
            data: adminUserInput
        })
        
        // Then authenticate with plain password
        adminAuth = await authUser(app, { 
            email: adminUserInput.email, 
            password: 'admin!' // Use plain password for login
        })
        
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

describe('SupportRequestsController/SupportRequestsAdminController (e2e)', () => {
    describe('GET ' + ENDPOINTS.SUPPORT_REQUESTS, () => {
        it('should return horeca requests', async () => {
            // Create support requests for this test
            await createSupportRequest(app, horecaAuth.accessToken, { content: 'As a horeca I need help!' })
            await createSupportRequest(app, horecaAuth.accessToken, { content: 'As a horeca I need another help!' })
            await createSupportRequest(app, providerAuth.accessToken, { content: 'As a provider I need help!' })

            const providerSupportRequests = await getUsersSupportRequests(app, providerAuth.accessToken, {
                status: SupportRequestStatus.Default,
            })

            const horecaSupportRequests = await getUsersSupportRequests(app, horecaAuth.accessToken)

            const adminSupportRequests = await getAdminSupportRequests(app, adminAuth.accessToken, {
                status: SupportRequestStatus.Default,
            })

            expect(providerSupportRequests).toHaveProperty('data')
            expect(providerSupportRequests).toHaveProperty('total')

            expect(providerSupportRequests.total).toBe(1)
            expect(providerSupportRequests.data[0]).toHaveProperty('content')

            expect(horecaSupportRequests).toHaveProperty('data')
            expect(horecaSupportRequests).toHaveProperty('total')

            expect(horecaSupportRequests.total).toBe(2)
            expect(horecaSupportRequests.data[0]).toHaveProperty('content')

            expect(adminSupportRequests).toHaveProperty('data')
            expect(adminSupportRequests).toHaveProperty('total')

            expect(adminSupportRequests.total).toBe(3)
            expect(horecaSupportRequests.data[0]).toHaveProperty('content')

            return
        })
    })
})
