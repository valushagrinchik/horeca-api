import { INestApplication } from '@nestjs/common'
import { 
    activateUser,
    addFavourites, 
    authUser, 
    deleteFavourites, 
    getFavourites, 
    getProfile, 
    initApp,
    registrateUser
} from './helpers/api'
import { ENDPOINTS } from './constants'
import { AuthResultDto } from '../src/auth/dto/auth.result.dto'
import { UserDto } from '../src/users/dto/user.dto'
import { horecaUsers, providerUsers } from './mock/authData'
import { DatabaseService } from '@/system/database/database.service'
import { cleanDatabase } from './helpers/seed'

let app: INestApplication
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let provider: UserDto
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

        provider = await getProfile(app, providerAuth.accessToken)
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

describe('FavouritesController (e2e)', () => {
    describe('POST ' + ENDPOINTS.HOREKA_FAVOURITES, () => {
        it('should return just created request data', async () => {
            const res = await addFavourites(app, horecaAuth.accessToken, { providerId: provider.id })

            expect(res).toHaveProperty('providerId')
            expect(res.providerId).toBe(provider.id)
            return
        })
    })

    describe('GET ' + ENDPOINTS.HOREKA_FAVOURITES, () => {
        it('should return paginated data', async () => {
            // Create a favourite first
            await addFavourites(app, horecaAuth.accessToken, { providerId: provider.id })
            
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
            // Create a favourite first
            await addFavourites(app, horecaAuth.accessToken, { providerId: provider.id })
            
            const res = await deleteFavourites(app, horecaAuth.accessToken, provider.id)

            expect(res.status).toBe('ok')
            return
        })
    })
})
