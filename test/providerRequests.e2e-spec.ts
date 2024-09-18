import { INestApplication } from '@nestjs/common'
import { authUser, createHorecaRequest, createProviderRequest, initApp } from './helpers'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from '../src/users/dto/auth.result.dto'
import { horecaUserInput, providerUserInput } from './mock/seedData'
import { generateAcceptUntil } from '../src/system/utils/date'
import { Categories } from '../src/system/utils/enums'

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

describe('ProviderRequestsController (e2e)', () => {
    describe('POST ' + ENDPOINTS.PROVIDER_REQUEST, () => {
        it('should return just created request data', async () => {
            const validAcceptUntill = generateAcceptUntil()

            const horecaCreateRequestRes = await createHorecaRequest(app, horecaAuth.accessToken, {
                items: [
                    {
                        name: 'string',
                        amount: 10,
                        unit: 'string',
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

            const res = await createProviderRequest(app, providerAuth.accessToken, {
                horecaRequestId: horecaCreateRequestRes.id,
                comment: 'string',
                items: horecaCreateRequestRes.items.map(item => ({
                    horecaRequestItemId: item.id,
                    available: true,
                    manufacturer: 'string',
                    cost: 2000,
                })),
            })

            createdRequestId = res.id

            expect(res).toHaveProperty('id')
            return
        })
    })
})
