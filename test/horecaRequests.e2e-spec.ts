import { INestApplication } from '@nestjs/common'
import { authUser, createHorecaRequest, findAllHorecaRequest, findAllHorecaRequestForProvider, initApp } from './helpers'
import { generateAcceptUntil } from './../src/system/utils/date'
import { Categories } from './../src/system/utils/enums'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from './../src/users/dto/auth.result.dto'

let app: INestApplication
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto

beforeAll(async () => {
    app = await initApp()

    horecaAuth = await authUser(app, {
        email: 'horeca@test.com',
        password: 'horeca!',
    })

    providerAuth = await authUser(app, {
        email: 'provider@test.com',
        password: 'provider!',
    })
})

afterAll(async () => {
    await app.close()
})

describe('HorecaRequestsController (e2e)', () => {
    describe('POST ' + ENDPOINTS.HOREKA_REQUESTS,  () => {
        it('should return just created request data', async () => {
            const validAcceptUntill = generateAcceptUntil()
    
            const res = await createHorecaRequest(app, horecaAuth.accessToken, {
                items: [
                    {
                        name: 'Thebest',
                        amount: 10,
                        unit: 'smth',
                        category: Categories.alcoholicDrinks,
                    },
                ],
                address: 'string',
                deliveryTime: validAcceptUntill,
                acceptUntill: validAcceptUntill,
                paymentType: 'Prepayment',
                name: 'string',
                phone: 'string',
                comment: 'string',
            })
    
            expect(res).toHaveProperty('id')
            expect(res.items.length).toBe(1)
            return
        })
    })

    describe('GET ' + ENDPOINTS.HOREKA_REQUESTS,  () => {
        it('should return array of requests', async () => {
            const res = await findAllHorecaRequest(app, horecaAuth.accessToken)
            return expect(res.length).toBeGreaterThan(0)
        })
    })

    describe('GET ' + ENDPOINTS.HOREKA_REQUESTS_FOR_PROVIDER,  () => {
        it('should return array of requests', async () => {
            const res = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)
            return expect(res.length).toBeGreaterThan(0)
        })
    })
})
