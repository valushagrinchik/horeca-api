import { INestApplication } from '@nestjs/common'
import { io } from 'socket.io-client'
import { ChatWsGateway } from '../src/chat/chat.ws.gateway'
import { WebsocketEvents } from '../src/system/utils/enums/websocketEvents.enum'
import { authUser, createChat, getProfile, initApp, prepareForChat } from './helpers'
import { AuthResultDto } from '../src/users/dto/auth.result.dto'
import { horecaUserInput, providerUserInput } from './mock/seedData'

let app: INestApplication
let gateway: ChatWsGateway
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        gateway = tm.get<ChatWsGateway>(ChatWsGateway)
    })

    horecaAuth = await authUser(app, horecaUserInput)
    providerAuth = await authUser(app, providerUserInput)
})

afterAll(async () => {
    await app.close()
})

describe('ChatWsGateway (e2e)', () => {
    it('ChatWsGateway be defined', () => {
        expect(gateway).toBeDefined()
    })

    it('Horeca can start chat and receive message from Provider', async () => {
        const { providerRequestId } = await prepareForChat(app, horecaAuth.accessToken, providerAuth.accessToken)
        const provider = await getProfile(app, providerAuth.accessToken)
        const horeca = await getProfile(app, horecaAuth.accessToken)

        const chat = await createChat(app, horecaAuth.accessToken, {
            opponentId: provider.id,
            providerRequestId,
        })

        const horecaWsClient = io(process.env.WS_URL, {
            autoConnect: false,
            transports: ['websocket'],
            extraHeaders: { authorization: 'Bearer ' + horecaAuth.accessToken },
        })

        const providerWsClient = io(process.env.WS_URL, {
            autoConnect: false,
            transports: ['websocket'],
            extraHeaders: { authorization: 'Bearer ' + providerAuth.accessToken },
        })

        horecaWsClient.connect()
        providerWsClient.connect()

        expect.assertions(2)

        return new Promise<void>(resolve => {
            providerWsClient.on(WebsocketEvents.MESSAGE, data => {
                const res = expect(data.message).toBe('Hello!')
                horecaWsClient.disconnect()
                providerWsClient.disconnect()
                return resolve(res)
            })

            providerWsClient.emit(WebsocketEvents.MESSAGE, {
                chatId: chat.id,
                message: 'Hi!',
                authorId: provider.id,
            })

            horecaWsClient.on(WebsocketEvents.MESSAGE, data => {
                const res = expect(data.message).toBe('Hi!')

                horecaWsClient.emit(WebsocketEvents.MESSAGE, {
                    chatId: chat.id,
                    message: 'Hello!',
                    authorId: horeca.id,
                })
            })
        })
    })
})
