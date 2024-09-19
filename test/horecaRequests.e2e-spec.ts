import { INestApplication } from '@nestjs/common'
import { authUser, createHorecaRequest, createProviderRequest, findAllHorecaRequest, getHorecaRequest, initApp } from './helpers'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from './../src/users/dto/auth.result.dto'
import { horecaRequestInput, horecaUserInput, providerUserInput } from './mock/seedData'

let app: INestApplication
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let createdRequestId: number

beforeAll(async () => {
    app = await initApp()

    horecaAuth = await authUser(app, horecaUserInput)
    providerAuth = await authUser(app, providerUserInput)
})

afterAll(async () => {
    await app.close()
})

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
                    horecaRequestItemId: item.horecaRequestId
                }))
            })

            const res = await getHorecaRequest(app, horecaAuth.accessToken, createdHorecaRequest.id)

            expect(res.id).toBe(createdHorecaRequest.id)
            expect(res).toHaveProperty('items')
            expect(res).toHaveProperty('providerRequests')
            expect(res.providerRequests.length).toBe(1)
            expect(res.providerRequests[0]).toHaveProperty('cover')
            expect(res.providerRequests[0].cover).toBe(1)

            expect(res.items.length).toBe(horecaRequestInput.items.length)
            return
        })
    })

    describe('GET ' + ENDPOINTS.HOREKA_REQUESTS, () => {
        it('should return array of requests', async () => {
            const res = await findAllHorecaRequest(app, horecaAuth.accessToken)

            expect(res.length).toBeGreaterThan(0)
            expect(res[0]).toHaveProperty('items')
            return
        })
    })
})
