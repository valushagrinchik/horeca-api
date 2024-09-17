import { INestApplication } from '@nestjs/common'
import { authUser, createHorecaRequest, findAllHorecaRequest, initApp } from './helpers'
import { generateAcceptUntil } from './../src/system/utils/date'
import { Categories } from './../src/system/utils/enums'

let app: INestApplication
let accessToken: string

beforeAll(async () => {
    app = await initApp()

    const authRes = await authUser(app, {
        email: 'horeca@test.com',
        password: 'horeca!',
    })

    accessToken = authRes.accessToken
})

afterAll(async () => {
    await app.close()
})

describe('HorecaRequestsController (e2e)', () => {
    it('create request should return associated data', async () => {
        const validAcceptUntill = generateAcceptUntil()

        const res = await createHorecaRequest(app, accessToken, {
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
    it('get horeca requests should return array of data', async () => {
        const res = await findAllHorecaRequest(app, accessToken)
        return expect(res.length).toBeGreaterThan(0)
    })
})
