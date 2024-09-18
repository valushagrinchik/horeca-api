import { INestApplication } from '@nestjs/common'
import { horecaUsers, providerUsers } from './mock/authData'
import { ErrorCodes } from './../src/system/utils/enums/errorCodes.enum'
import { UsersDbService } from './../src/users/services/users.db.service'
import { DatabaseService } from './../src/system/database/database.service'
import { activateUser, authUser, initApp, registrateUser } from './helpers'
import { ENDPOINTS } from './constants'

let app: INestApplication

let users = []

beforeAll(async () => {
    const dbService = new DatabaseService()
    const usersDbServiceMocked = new UsersDbService(dbService)
    usersDbServiceMocked.createUser = new Proxy(usersDbServiceMocked.createUser, {
        async apply(target, thisArg, argumentsList) {
            const user = await Reflect.apply(target, thisArg, argumentsList)
            users.push(user)
            return user
        },
    })

    app = await initApp(mb => {
        mb.overrideProvider(UsersDbService).useValue(usersDbServiceMocked)
    })
})

afterAll(async () => {
    await app.close()
})

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
                expect(res.email).toEqual(payload.email)
                return
            })
        })

        describe('POST ' + ENDPOINTS.SIGNIN, () => {
            it('should throw an AUTH_FAIL in case of profile is not activated', async () => {
                const res = await authUser(app, {
                    email: payload.email,
                    password: payload.password,
                })

                expect(res.statusCode).toEqual(400)
                expect(res.errorMessage).toEqual(ErrorCodes.AUTH_FAIL)
                return
            })
            it('should return accessToken and refreshToken', async () => {
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
