import { INestApplication } from '@nestjs/common'
import { authUser, getProfile, initApp, updateProfile } from './helpers'
import { AuthResultDto } from './../src/users/dto/auth.result.dto'
import { ENDPOINTS } from './constants'
import { horecaUserInput } from './mock/seedData'

let app: INestApplication
let horecaAuth: AuthResultDto

beforeAll(async () => {
    app = await initApp()
    horecaAuth = await authUser(app, horecaUserInput)
})

afterAll(async () => {
    await app.close()
})

describe('UsersController (e2e)', () => {
    describe('GET ' + ENDPOINTS.PROFILE, () => {
        it('should return profile data', async () => {
            const res = await getProfile(app, horecaAuth.accessToken)

            expect(res).toHaveProperty('id')
            expect(res.email).toBe(horecaUserInput.email)
            return
        })
    })

    describe('PUT ' + ENDPOINTS.PROFILE, () => {
        it('update profile should be success', async () => {
            const res = await updateProfile(app, horecaAuth.accessToken, {
                phone: '123123',
                profile: {
                    info: 'updated',
                },
            })
            expect(res.email).toBe(horecaUserInput.email)
            expect(res).toHaveProperty('id')
            expect(res.phone).toBe('123123')
            expect(res.profile.info).toBe('updated')
            return
        })
    })
})
