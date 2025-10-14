import { INestApplication } from '@nestjs/common'
import { horecaUsers, providerUsers } from './mock/authData'
import { ErrorCodes } from '@/shared/utils'
import { UsersDbService } from '../src/users/users.db.service'
import { DatabaseService } from './../src/system/database/database.service'
import { activateUser, authUser, initApp, registrateUser } from './helpers/api'
import { ENDPOINTS } from './constants'
import { MailerService } from '@nestjs-modules/mailer'
import { MailService } from '../src/mail/mail.service'
import { cleanDatabase } from './helpers/seed'

let app: INestApplication
let mailer: MailerService
let users = []
let db: DatabaseService

beforeAll(async () => {
    const mailServiceMocked = { sendMail: jest.fn(), sendActivationMail: jest.fn() }

    app = await initApp(
        mb => {
            mb.overrideProvider(MailService).useValue(mailServiceMocked)
        },
        tm => {
            mailer = tm.get<MailerService>(MailerService)
            db = tm.get<DatabaseService>(DatabaseService)
        }
    )
})

beforeEach(async () => {
    try {
        await cleanDatabase(db)
        users = [] // Reset users array
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

describe('AuthorizationController (e2e)', () => {
    describe.each([
        ['Horeca', horecaUsers[0]],
        ['Provider', providerUsers[0]],
    ])('%p', (type, payload) => {
        describe('POST ' + ENDPOINTS.SIGNUP, () => {
            it('should throw an GDPR_IS_NOT_APPROVED in case of GDPRApproved is not set', async () => {
                const res = await registrateUser(app, { ...payload, GDPRApproved: false })
                expect(res.statusCode).toEqual(400)
                expect(res.errorMessage).toEqual(ErrorCodes.GDPR_IS_NOT_APPROVED)
                return
            })
            it('should return just created user', async () => {
                const res = await registrateUser(app, payload)
                expect(res).toHaveProperty('id')
                expect(res).toHaveProperty('profile')
                expect(res.email).toEqual(payload.email)
                
                // Store user for later tests
                users.push(res)
                return
            })
        })

        describe('POST ' + ENDPOINTS.SIGNIN, () => {
            it('should throw an AUTH_FAIL in case of profile is not activated', async () => {
                // Create user first
                const userRes = await registrateUser(app, payload)
                users.push(userRes)

                const res = await authUser(app, {
                    email: payload.email,
                    password: payload.password,
                })

                expect(res.statusCode).toEqual(400)
                expect(res.errorMessage).toEqual(ErrorCodes.AUTH_FAIL)
                return
            })
            it('should return accessToken and refreshToken', async () => {
                // Create user first
                const userRes = await registrateUser(app, payload)
                users.push(userRes)
                
                const user = users.find(user => user.email == payload.email)
                await activateUser(app, user.activationLink)

                const res = await authUser(app, {
                    email: payload.email,
                    password: payload.password,
                })

                expect(res).toHaveProperty('accessToken')
                expect(res).toHaveProperty('refreshToken')
                return
            })
        })
    })
})
