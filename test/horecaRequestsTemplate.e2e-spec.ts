import { INestApplication } from '@nestjs/common'
import {
    authUser,
    createHorecaRequestTemplate,
    deleteHorecaRequestTemplate,
    getHorecaRequestTemplate,
    getHorecaRequestTemplates,
    initApp,
    updateHorecaRequestTemplate,
} from './helpers'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from '../src/users/dto/auth.result.dto'
import { horecaRequestInput, horecaUserInput, providerUserInput } from './mock/seedData'
import { ErrorCodes } from '../src/system/utils/enums/errorCodes.enum'
import { Categories } from '../src/system/utils/enums'

let app: INestApplication
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let createdTemplateId: number

beforeAll(async () => {
    app = await initApp()

    horecaAuth = await authUser(app, horecaUserInput)
    providerAuth = await authUser(app, providerUserInput)
})

afterAll(async () => {
    await app.close()
})

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
            await updateHorecaRequestTemplate(app, horecaAuth.accessToken, createdTemplateId, newTemplate)
            const res = await getHorecaRequestTemplate(app, horecaAuth.accessToken, createdTemplateId)

            expect(res.name).toBe(newTemplate.name)
            expect(res.content).toBe(JSON.stringify(newTemplate.content))
            expect(res).toHaveProperty('id')
            return
        })
    })

    describe('GET ' + ENDPOINTS.HOREKA_REQUESTS_TEMPLATES, () => {
        it('should return request data', async () => {
            const res = await getHorecaRequestTemplate(app, horecaAuth.accessToken, createdTemplateId)

            expect(res.id).toBe(createdTemplateId)
            return
        })
    })

    describe('GET ' + ENDPOINTS.HOREKA_REQUESTS_TEMPLATES, () => {
        it('should return paginated data', async () => {
            const res = await getHorecaRequestTemplates(app, horecaAuth.accessToken)

            expect(res).toHaveProperty('data')
            expect(res).toHaveProperty('total')

            expect(res.data.length).toBeGreaterThan(0)
            expect(res.data[0].id).toBe(createdTemplateId)
            return
        })
    })

    describe('DELETE ' + ENDPOINTS.HOREKA_REQUESTS_TEMPLATES, () => {
        it('should delete template', async () => {
            const deleteRes = await deleteHorecaRequestTemplate(app, horecaAuth.accessToken, createdTemplateId)
            const res = await getHorecaRequestTemplate(app, horecaAuth.accessToken, createdTemplateId)

            expect(deleteRes).toHaveProperty('status')
            expect(deleteRes.status).toBe('ok')

            expect(res.statusCode).toEqual(400)
            expect(res.errorMessage).toEqual(ErrorCodes.TEMPLATE_DOES_NOT_EXISTS)

            return
        })
    })
})
