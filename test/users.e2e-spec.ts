import { INestApplication } from '@nestjs/common'
import { authUser, getProfile, initApp, updateProfile } from './helpers'

let app: INestApplication

beforeAll(async () => {
    app = await initApp()
})

afterAll(async () => {
    await app.close()
})

describe('UsersController (e2e)', () => {
    it('get profile should return profile data', async () => {
        const authRes = await authUser(app, {
            email: 'horeca@test.com',
            password: 'horeca!',
        })
        const res = await getProfile(app, authRes.accessToken)

        expect(res).toHaveProperty('id')
        expect(res.email).toBe('horeca@test.com')
    })
    it('update profile should be success', async () => {
        const authRes = await authUser(app, {
            email: 'horeca@test.com',
            password: 'horeca!',
        })
        const res = await updateProfile(app, authRes.accessToken, {
            phone: '123123',
            profile: {
                info: 'updated',
            },
        })
        expect(res.email).toBe('horeca@test.com')
        expect(res).toHaveProperty('id')
        expect(res.phone).toBe('123123')
        expect(res.profile.info).toBe('updated')
    })
})
