import { INestApplication } from '@nestjs/common'
import { addFavourites, authUser, deleteFavourites, getFavourites, getProfile, initApp } from './helpers'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from '../src/users/dto/auth.result.dto'
import { horecaUserInput, providerUserInput } from './mock/seedData'
import { UserDto } from '../src/users/dto/user.dto'

let app: INestApplication
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto

let provider: UserDto

beforeAll(async () => {
    app = await initApp()

    horecaAuth = await authUser(app, horecaUserInput)
    providerAuth = await authUser(app, providerUserInput)

    provider = await getProfile(app, providerAuth.accessToken)
})

afterAll(async () => {
    await app.close()
})

describe('FavouritesController (e2e)', () => {
    describe('POST ' + ENDPOINTS.HOREKA_FAVOURITES, () => {
        it('should return just created request data', async () => {
            await addFavourites(app, horecaAuth.accessToken, { providerId: provider.id })
            const res = await addFavourites(app, horecaAuth.accessToken, { providerId: provider.id })

            expect(res.status).toBe('ok')
            return
        })
    })

    describe('GET ' + ENDPOINTS.HOREKA_FAVOURITES, () => {
        it('should return paginated data', async () => {
            const res = await getFavourites(app, horecaAuth.accessToken)

            expect(res).toHaveProperty('data')
            expect(res).toHaveProperty('total')

            expect(res.data.length).toBeGreaterThan(0)
            expect(res.data[0]).toHaveProperty('providerId')
            expect(res.data[0].providerId).toBe(provider.id)
            return
        })
    })

    describe('DELETE ' + ENDPOINTS.HOREKA_FAVOURITES, () => {
        it('should return request data', async () => {
            const res = await deleteFavourites(app, horecaAuth.accessToken, provider.id)

            expect(res.status).toBe('ok')
            return
        })
    })
})
