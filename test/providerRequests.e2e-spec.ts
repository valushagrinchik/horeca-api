import { INestApplication } from '@nestjs/common'
import {
    approveProviderRequest,
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
import { generateFutureDate } from '../src/system/utils/date'
import { Categories } from '../src/system/utils/enums'

let app: INestApplication
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto

let createdhorecaRequestId: number
let createdProviderRequestId: number

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
        it('should return paginated data and total', async () => {
            const res = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)

            expect(res).toHaveProperty('data')
            expect(res).toHaveProperty('total')

            expect(res.data.length).toBeGreaterThan(0)
            expect(res.data[0]).toHaveProperty('items')

            return
        })

        describe('without search filter (that means "active") ', () => {
            it('should return array of active horeca requests that matche with providers categories', async () => {
                const res = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)

                const user = await getProfile(app, providerAuth.accessToken)

                const crossedCategoryItemsLength = horecaRequestInput.items.filter(item =>
                    user.profile.categories.includes(item.category)
                ).length
                expect(res.data.length).toBeGreaterThan(0)
                expect(res.data[0]).toHaveProperty('items')
                expect(res.data[0].items.length).toBe(crossedCategoryItemsLength)

                return
            })
        })
        describe('with search filter {includeHiddenAndViewed: true}', () => {
            it('should return array of inactive horeca requests that match with providers categories', async () => {
                const res = await findAllHorecaRequestForProvider(app, providerAuth.accessToken, {
                    search: JSON.stringify({ includeHiddenAndViewed: true }),
                })

                expect(res.data.length).toBe(1)

                return
            })
        })
    })
    describe('POST ' + ENDPOINTS.HOREKA_REQUESTS_FOR_PROVIDER_STATUS, () => {
        it('should apply "viewed" status to one of horeca request and delete it from active requests list', async () => {
            expect.assertions(3)
            const horecaRequestsRes = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)
            expect(horecaRequestsRes.data.length).toBeGreaterThan(0)

            const res = await setHorecaRequestStatus(app, providerAuth.accessToken, {
                horecaRequestId: horecaRequestsRes.data[0].id,
                viewed: true,
            })
            expect(res.status).toBe('ok')

            const horecaRequestsRes2 = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)
            expect(horecaRequestsRes2.data.length).toBe(horecaRequestsRes.data.length - 1)

            return
        })
    })
    describe('POST ' + ENDPOINTS.PROVIDER_REQUESTS, () => {
        it('should return just created request data', async () => {
            const acceptUntill = generateFutureDate()
            const deliveryTime = generateFutureDate(14)

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
                deliveryTime,
                acceptUntill,
                paymentType: 'Prepayment',
                name: 'string',
                phone: 'string',
                comment: 'string',
            })

            const providerCreateRequestRes = await createProviderRequest(app, providerAuth.accessToken, {
                horecaRequestId: horecaCreateRequestRes.id,
                comment: 'string',
                items: horecaCreateRequestRes.items.map(item => ({
                    horecaRequestItemId: item.id,
                    available: true,
                    manufacturer: 'string',
                    cost: 2000,
                })),
            })

            createdhorecaRequestId = horecaCreateRequestRes.id
            createdProviderRequestId = providerCreateRequestRes.id

            expect(providerCreateRequestRes).toHaveProperty('id')
            return
        })
    })

    describe('GET ' + ENDPOINTS.PROVIDER_REQUESTS, () => {
        it('should return paginated data and total', async () => {
            const res = await findAllProviderRequests(app, providerAuth.accessToken)

            expect(res).toHaveProperty('data')
            expect(res).toHaveProperty('total')

            expect(res.data.length).toBeGreaterThan(0)
            expect(res.data[0]).toHaveProperty('items')
            return
        })
    })

    // TODO: move to horeca requests tests
    describe('POST ' + ENDPOINTS.HOREKA_APPROVE_PROVIDER_REQUEST, () => {
        it('should return just created request data', async () => {
            const res = await approveProviderRequest(app, horecaAuth.accessToken, {
                horecaRequestId: createdhorecaRequestId,
                providerRequestId: createdProviderRequestId,
            })

            expect(res.status).toBe('ok')
            return
        })
    })
})
