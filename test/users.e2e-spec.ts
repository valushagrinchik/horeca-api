import { INestApplication } from '@nestjs/common'
import { 
    activateUser,
    authUser, 
    getProfile, 
    initApp, 
    registrateUser,
    updateProfile 
} from './helpers/api'
import { AuthResultDto } from '../src/auth/dto/auth.result.dto'
import { ENDPOINTS } from './constants'
import { horecaUsers, providerUsers } from './mock/authData'
import { DatabaseService } from '@/system/database/database.service'
import { cleanDatabase } from './helpers/seed'

let app: INestApplication
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
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

describe('UsersController (e2e)', () => {
    describe('GET ' + ENDPOINTS.PROFILE, () => {
        it('should return profile data', async () => {
            const res = await getProfile(app, horecaAuth.accessToken)

            expect(res).toHaveProperty('id')
            expect(res.email).toBe(horecaUsers[0].email)
            return
        })
    })

    describe('PUT ' + ENDPOINTS.PROFILE, () => {
        it('update horeca profile should be success', async () => {
            const res = await updateProfile(app, horecaAuth.accessToken, {
                phone: '123123',
                profile: {
                    info: 'updated',
                },
            })
            expect(res.email).toBe(horecaUsers[0].email)
            expect(res).toHaveProperty('id')
            expect(res.phone).toBe('123123')
            expect(res.profile.info).toBe('updated')
            return
        })

        it('update provider profile should be success', async () => {
            const res = await updateProfile(app, providerAuth.accessToken, {
                phone: '123123',
                profile: {
                    deliveryMethods: [],
                },
            })
            expect(res.email).toBe(providerUsers[0].email)
            expect(res).toHaveProperty('id')
            expect(res.phone).toBe('123123')
            return
        })
    })
})
