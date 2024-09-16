import { INestApplication } from '@nestjs/common'
import { AppModule } from '../src/app.module'
import { Test, TestingModule } from '@nestjs/testing'
import { authUser, getProfile, updateProfile } from './helpers'

let moduleFixture: TestingModule
let app: INestApplication

beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
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
