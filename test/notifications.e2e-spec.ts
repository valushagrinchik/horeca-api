import { INestApplication } from '@nestjs/common'
import { addFavourites, authUser, getProfile, initApp, ioClient } from './helpers'
import { AuthResultDto } from '../src/auth/dto/auth.result.dto'
import { horecaUserInput, providerUserInput } from './mock/seedData'
import { UserDto } from '../src/users/dto/user.dto'
import { NotificationWsGateway } from '@/notifications/notification.ws.gateway'
import { NotificationEvents } from '@/shared/utils'
import { horecaUsers } from './mock/authData'

let app: INestApplication
let gateway: NotificationWsGateway
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let horeca: UserDto
let provider: UserDto

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        gateway = tm.get<NotificationWsGateway>(NotificationWsGateway)
    })

    horecaAuth = await authUser(app, horecaUserInput)
    providerAuth = await authUser(app, providerUserInput)

    horeca = await getProfile(app, horecaAuth.accessToken)
    provider = await getProfile(app, providerAuth.accessToken)
})

afterAll(async () => {
    await app.close()
})

describe('NotificationWsGateway (e2e)', () => {
    it('NotificationWsGateway be defined', () => {
        expect(gateway).toBeDefined()
    })

    describe('.sendNotification', () => {
        it('should be called and sent the notification to the provider when horeca added him to the favs', async () => {
            const providerWsClient = ioClient('notifications', providerAuth.accessToken)

            providerWsClient.connect()

            const promise = new Promise<void>(resolve => {
                providerWsClient.on(NotificationEvents.PROVIDER_ADDED_TO_FAVOURITES, data => {
                    const res = expect(data.data.horecaId).toBe(horeca.id)
                    providerWsClient.disconnect()
                    return resolve(res)
                })
            })

            await addFavourites(app, horecaAuth.accessToken, { providerId: provider.id })
            return promise
        })
    })
})
