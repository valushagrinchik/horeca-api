import { INestApplication } from '@nestjs/common'
import {
    authUser,
    createHorecaRequestTemplate,
    getHorecaRequestTemplate,
    initApp,
} from './helpers'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from '../src/users/dto/auth.result.dto'
import { horecaRequestInput, horecaUserInput, providerUserInput } from './mock/seedData'

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
    describe('POST ' + ENDPOINTS.HOREKA_REQUESTS_TEMPLATE, () => {
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

    describe('GET ' + ENDPOINTS.HOREKA_REQUESTS_TEMPLATE, () => {
        it('should return request data', async () => {
            const res = await getHorecaRequestTemplate(app, horecaAuth.accessToken, createdTemplateId)

            expect(res.id).toBe(createdTemplateId)
            return
        })
    })
})
