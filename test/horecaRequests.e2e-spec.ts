import { INestApplication } from '@nestjs/common'
import {
    authUser,
    createHorecaRequest,
    findAllHorecaRequest,
    findAllHorecaRequestForProvider,
    getHorecaRequest,
    initApp,
} from './helpers'
import { generateAcceptUntil } from './../src/system/utils/date'
import { Categories } from './../src/system/utils/enums'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from './../src/users/dto/auth.result.dto'
import { horecaUserInput, providerUserInput } from './mock/seedData'

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

            createdRequestId = res.id

            expect(res).toHaveProperty('id')
            expect(res.items.length).toBe(1)
            return
        })
    })

    describe('GET ' + ENDPOINTS.HOREKA_REQUEST, () => {
        it('should return request data', async () => {
            const res = await getHorecaRequest(app, horecaAuth.accessToken, createdRequestId)

            expect(res.id).toBe(createdRequestId)
            expect(res).toHaveProperty('items')
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

    describe('GET ' + ENDPOINTS.HOREKA_REQUESTS_FOR_PROVIDER, () => {
        it('should return array of horeca requests that matche with providers categories', async () => {
            const res = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)

            expect(res.length).toBeGreaterThan(0)
            expect(res[0]).toHaveProperty('items')
            return
        })
    })
})
