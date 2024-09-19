import { INestApplication } from '@nestjs/common'
import {
    authUser,
    createHorecaRequest,
    createProviderRequest,
    findAllHorecaRequestForProvider,
    findAllProviderRequests,
    getProfile,
    initApp,
    setHorecaRequestStatus,
} from './helpers'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from '../src/users/dto/auth.result.dto'
import { horecaRequestInput, horecaUserInput, providerUserInput } from './mock/seedData'
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
    describe('GET ' + ENDPOINTS.HOREKA_REQUESTS_FOR_PROVIDER, () => {
        beforeAll(async () => {
            await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput)
        })
        describe('without search filter (that means "active") ', () => {
            it('should return array of active horeca requests that matche with providers categories', async () => {
                const res = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)

                const user = await getProfile(app, providerAuth.accessToken)

                const crossedCategoryItemsLength = horecaRequestInput.items.filter(item =>
                    user.profile.categories.includes(item.category)
                ).length
                expect(res.length).toBeGreaterThan(0)
                expect(res[0]).toHaveProperty('items')
                expect(res[0].items.length).toBe(crossedCategoryItemsLength)

                return
            })
        })
        describe('with search filter {inactive: true}', () => {
            it('should return array of inactive horeca requests that matche with providers categories', async () => {
                const res = await findAllHorecaRequestForProvider(app, providerAuth.accessToken, {
                    search: { inactive: true },
                })

                expect(res.length).toBe(0)

                return
            })
        })
    })
    describe('POST ' + ENDPOINTS.HOREKA_REQUESTS_FOR_PROVIDER_STATUS, () => {
        it('should change reqponse of GET ' + ENDPOINTS.HOREKA_REQUESTS_FOR_PROVIDER, async () => {
            expect.assertions(3)
            const horecaRequestsRes = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)
            expect(horecaRequestsRes.length).toBeGreaterThan(0)

            const res = await setHorecaRequestStatus(app, providerAuth.accessToken, {
                horecaRequestId: horecaRequestsRes[0].id,
                viewed: true,
            })
            expect(res.status).toBe('ok')

            const horecaRequestsRes2 = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)
            expect(horecaRequestsRes2.length).toBe(0)

            return
        })
    })
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

    describe('GET ' + ENDPOINTS.PROVIDER_REQUEST, () => {
        it('should return just created request data', async () => {
           const res = await findAllProviderRequests(app, providerAuth.accessToken)

           expect(res.length).toBeGreaterThan(0)
        })
    })
})
