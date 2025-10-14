import { INestApplication } from '@nestjs/common'
import {
    activateUser,
    approveProviderRequest,
    authUser,
    createHorecaRequest,
    createProviderRequest,
    findAllHorecaRequestForProvider,
    findAllProviderRequests,
    getHorecaRequestForProvider,
    getProfile,
    initApp,
    registrateUser,
    setHorecaRequestStatus,
} from './helpers/api'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from '../src/auth/dto/auth.result.dto'
import { horecaRequestInput, horecaRequestInput2 } from './mock/seedData'
import { horecaUsers, providerUsers } from './mock/authData'
import { generateFutureDate, Categories } from '@/shared/utils'
import { ProviderHorecaRequestStatus } from '../src/providerRequests/dto/provider.horecaRequest.search.dto'
import { DatabaseService } from '@/system/database/database.service'
import { cleanDatabase } from './helpers/seed'
import { RequestsMatcherDbService } from '@/shared/requestsMatcher/requestsMatcher.db.service'

let app: INestApplication
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
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

describe('ProviderRequestsController (e2e)', () => {
    describe('GET ' + ENDPOINTS.HOREKA_REQUESTS_FOR_PROVIDER, () => {
        it('should return paginated data and total', async () => {
            // Create horeca requests for this test
            await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput)
            await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput2)

            await matcher.updateView()
            
            const res = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)

            expect(res).toHaveProperty('data')
            expect(res).toHaveProperty('total')

            expect(res.data.length).toBeGreaterThan(0)
            expect(res.data[0]).toHaveProperty('items')

            return
        })

        it('should return data sorted by cover desc', async () => {
            // Create horeca requests for this test
            await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput)
            await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput2)
            
            await matcher.updateView()

            const res = await findAllHorecaRequestForProvider(app, providerAuth.accessToken, { sort: 'cover|desc' })

            expect(res).toHaveProperty('data')
            expect(res).toHaveProperty('total')

            expect(res.data.length).toBe(2)
            expect(res.data[0].cover).toBeGreaterThan(res.data[1].cover)

            return
        })

        it('should return data sorted by cover asc', async () => {
            // Create horeca requests for this test
            await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput)
            await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput2)
            await matcher.updateView()
            const res = await findAllHorecaRequestForProvider(app, providerAuth.accessToken, { sort: 'cover|asc' })

            expect(res).toHaveProperty('data')
            expect(res).toHaveProperty('total')

            expect(res.data.length).toBe(2)
            expect(res.data[0].cover).toBeLessThan(res.data[1].cover)

            return
        })

        describe('get active horeca requests for provider', () => {
            it('should return array of active horeca requests that matche with providers categories', async () => {
                await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput)
                await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput2)
                await matcher.updateView()
                const res = await findAllHorecaRequestForProvider(app, providerAuth.accessToken, {
                    sort: 'createdAt|asc',
                })
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

        describe('get all (active and hidden or viewed) horeca requests for provider', () => {
            it('should return array of inactive horeca requests that match with providers categories', async () => {
                await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput)
                await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput2)
                await matcher.updateView()
                const res = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)
                expect(res.data.length).toBe(2)

                return
            })
        })
    })

    describe('GET ' + ENDPOINTS.HOREKA_REQUEST_FOR_PROVIDER, () => {
        describe('get horeca request by id', () => {
            it('should return horeca request with only matched items by categories', async () => {
                await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput)
                await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput2)
                await matcher.updateView()
                const all = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)
                const res = await getHorecaRequestForProvider(
                    app,
                    providerAuth.accessToken,
                    all.data.find(hr => hr.name == horecaRequestInput.name).id
                )
                const user = await getProfile(app, providerAuth.accessToken)
                const crossedCategoryItemsLength = horecaRequestInput.items.filter(item =>
                    user.profile.categories.includes(item.category)
                ).length
                expect(res.items.length).toBe(crossedCategoryItemsLength)
            })
        })
    })

    describe('POST ' + ENDPOINTS.HOREKA_REQUESTS_FOR_PROVIDER_STATUS, () => {
        it('should apply "viewed" status to one of horeca request and delete it from active requests list', async () => {
            await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput)
            await createHorecaRequest(app, horecaAuth.accessToken, horecaRequestInput2)
            await matcher.updateView()
            expect.assertions(11)
            const actualRes = await findAllHorecaRequestForProvider(app, providerAuth.accessToken, {
                search: { status: ProviderHorecaRequestStatus.Actual },
            })
            const hiddenRes = await findAllHorecaRequestForProvider(app, providerAuth.accessToken, {
                search: { status: ProviderHorecaRequestStatus.Hidden },
            })
            const allRes = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)
            expect(actualRes.data.length).toBe(2)
            expect(hiddenRes.data.length).toBe(0)
            expect(allRes.data.length).toBe(2)

            const setHiddenRes = await setHorecaRequestStatus(app, providerAuth.accessToken, {
                horecaRequestId: actualRes.data[0].id,
                hidden: true,
            })
            expect(setHiddenRes.status).toBe('ok')

            const actualRes2 = await findAllHorecaRequestForProvider(app, providerAuth.accessToken, {
                search: { status: ProviderHorecaRequestStatus.Actual },
            })
            const hiddenRes2 = await findAllHorecaRequestForProvider(app, providerAuth.accessToken, {
                search: { status: ProviderHorecaRequestStatus.Hidden },
            })
            const allRes2 = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)

            expect(actualRes2.data.length).toBe(actualRes.data.length - 1)
            expect(hiddenRes2.data.length).toBe(1)
            expect(allRes2.data.length).toBe(2)

            const setHiddenRes2 = await setHorecaRequestStatus(app, providerAuth.accessToken, {
                horecaRequestId: actualRes.data[0].id,
                hidden: false,
            })
            expect(setHiddenRes2.status).toBe('ok')

            const actualRes3 = await findAllHorecaRequestForProvider(app, providerAuth.accessToken, {
                search: { status: ProviderHorecaRequestStatus.Actual },
            })
            const hiddenRes3 = await findAllHorecaRequestForProvider(app, providerAuth.accessToken, {
                search: { status: ProviderHorecaRequestStatus.Hidden },
            })
            const allRes3 = await findAllHorecaRequestForProvider(app, providerAuth.accessToken)
            expect(actualRes3.data.length).toBe(2)
            expect(hiddenRes3.data.length).toBe(0)
            expect(allRes3.data.length).toBe(2)

            return
        })
    })
    describe('POST ' + ENDPOINTS.PROVIDER_REQUESTS, () => {

        it('should return just created request data', async () => {
            expect.assertions(2)
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
            expect(horecaCreateRequestRes).toHaveProperty('id')

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

            expect(providerCreateRequestRes).toHaveProperty('id')
            return
        })

        it('should exclude horeca request that provider just created request data for from income list', async () => {
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
            expect(horecaCreateRequestRes).toHaveProperty('id')

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
            
            await matcher.updateView()

            const res = await findAllHorecaRequestForProvider(app, providerAuth.accessToken, {
                sort: 'createdAt|asc',
            })

            expect(res.data.find(r => r.id == horecaCreateRequestRes.id)).toBe(undefined)
            return
        })
    })

    describe('GET ' + ENDPOINTS.PROVIDER_REQUESTS, () => {
        it('should return paginated data and total', async () => {
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

            const res = await approveProviderRequest(app, horecaAuth.accessToken, {
                horecaRequestId: horecaCreateRequestRes.id,
                providerRequestId: providerCreateRequestRes.id,
            })

            expect(res.status).toBe('ok')
            return
        })
    })
})
