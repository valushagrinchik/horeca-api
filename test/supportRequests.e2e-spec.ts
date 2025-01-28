import { INestApplication } from '@nestjs/common'
import { authUser, createSupportRequest, getAdminSupportRequests, getUsersSupportRequests, initApp } from './helpers'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from '../src/users/dto/auth.result.dto'
import { adminUserInput, horecaUserInput, providerUserInput } from './mock/seedData'
import { SupportRequestStatus } from '@prisma/client'

let app: INestApplication
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let adminAuth: AuthResultDto

beforeAll(async () => {
    app = await initApp()

    horecaAuth = await authUser(app, horecaUserInput)
    providerAuth = await authUser(app, providerUserInput)
    adminAuth = await authUser(app, adminUserInput)
})

afterAll(async () => {
    await app.close()
})

describe('SupportRequestsController/SupportRequestsAdminController (e2e)', () => {
    describe('GET ' + ENDPOINTS.SUPPORT_REQUESTS, () => {
        beforeAll(async () => {
            await createSupportRequest(app, horecaAuth.accessToken, { content: 'As a horeca I need help!' })
            await createSupportRequest(app, horecaAuth.accessToken, { content: 'As a horeca I need another help!' })

            await createSupportRequest(app, providerAuth.accessToken, { content: 'As a provider I need help!' })
        })
        it('should return horeca requests', async () => {
            const providerSupportRequests = await getUsersSupportRequests(app, providerAuth.accessToken, {
                status: SupportRequestStatus.Default,
            })
            const horecaSupportRequests = await getUsersSupportRequests(app, horecaAuth.accessToken)

            const adminSupportRequests = await getAdminSupportRequests(app, adminAuth.accessToken)

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
