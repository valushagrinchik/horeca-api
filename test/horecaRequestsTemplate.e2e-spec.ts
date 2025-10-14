import { INestApplication } from '@nestjs/common'
import {
    activateUser,
    authUser,
    createHorecaRequestTemplate,
    deleteHorecaRequestTemplate,
    getHorecaRequestTemplate,
    getHorecaRequestTemplates,
    initApp,
    registrateUser,
    updateHorecaRequestTemplate,
} from './helpers/api'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from '../src/auth/dto/auth.result.dto'
import { horecaRequestInput } from './mock/seedData'
import { horecaUsers, providerUsers } from './mock/authData'
import { ErrorCodes, Categories } from '@/shared/utils'
import { DatabaseService } from '@/system/database/database.service'
import { cleanDatabase } from './helpers/seed'

let app: INestApplication
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let createdTemplateId: number
let db: DatabaseService

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        db = tm.get<DatabaseService>(DatabaseService)
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

describe('HorecaRequestsTemplateController (e2e)', () => {
    describe('POST ' + ENDPOINTS.HOREKA_REQUESTS_TEMPLATES, () => {
        it('should return just created request data', async () => {
            const res = await createHorecaRequestTemplate(app, horecaAuth.accessToken, {
                name: 'template1',
                content: horecaRequestInput,
            })
            createdTemplateId = res.id

            expect(res).toHaveProperty('id')
            return
        })
    })

    describe('PUT ' + ENDPOINTS.HOREKA_REQUESTS_TEMPLATES, () => {
        it('should update template', async () => {
            // Create a template first
            const template = await createHorecaRequestTemplate(app, horecaAuth.accessToken, {
                name: 'template1',
                content: horecaRequestInput,
            })
            
            const newTemplate = {
                name: 'template2',
                content: {
                    items: [
                        {
                            name: 'BBB',
                            amount: 2000,
                            unit: 'eee',
                            category: Categories.fish,
                        },
                    ],
                },
            }
            await updateHorecaRequestTemplate(app, horecaAuth.accessToken, template.id, newTemplate)
            const res = await getHorecaRequestTemplate(app, horecaAuth.accessToken, template.id)

            expect(res.name).toBe(newTemplate.name)
            expect(res.content).toBe(JSON.stringify(newTemplate.content))
            expect(res).toHaveProperty('id')
            return
        })
    })

    describe('GET ' + ENDPOINTS.HOREKA_REQUESTS_TEMPLATES, () => {
        it('should return request data', async () => {
            // Create a template first
            const template = await createHorecaRequestTemplate(app, horecaAuth.accessToken, {
                name: 'template1',
                content: horecaRequestInput,
            })
            
            const res = await getHorecaRequestTemplate(app, horecaAuth.accessToken, template.id)

            expect(res.id).toBe(template.id)
            return
        })
    })

    describe('GET ' + ENDPOINTS.HOREKA_REQUESTS_TEMPLATES, () => {
        it('should return paginated data', async () => {
            // Create a template first
            const template = await createHorecaRequestTemplate(app, horecaAuth.accessToken, {
                name: 'template1',
                content: horecaRequestInput,
            })
            
            const res = await getHorecaRequestTemplates(app, horecaAuth.accessToken)

            expect(res).toHaveProperty('data')
            expect(res).toHaveProperty('total')

            expect(res.data.length).toBeGreaterThan(0)
            expect(res.data[0].id).toBe(template.id)
            return
        })
    })

    describe('DELETE ' + ENDPOINTS.HOREKA_REQUESTS_TEMPLATES, () => {
        it('should delete template', async () => {
            // Create a template first
            const template = await createHorecaRequestTemplate(app, horecaAuth.accessToken, {
                name: 'template1',
                content: horecaRequestInput,
            })
            
            const deleteRes = await deleteHorecaRequestTemplate(app, horecaAuth.accessToken, template.id)
            const res = await getHorecaRequestTemplate(app, horecaAuth.accessToken, template.id)

            expect(deleteRes).toHaveProperty('status')
            expect(deleteRes.status).toBe('ok')

            expect(res.statusCode).toEqual(400)
            expect(res.errorMessage).toEqual(ErrorCodes.TEMPLATE_DOES_NOT_EXISTS)

            return
        })
    })
})
