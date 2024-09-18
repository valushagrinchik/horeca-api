import { INestApplication } from '@nestjs/common'
import { io } from 'socket.io-client'
import { ChatWsGateway } from '../src/chat/chat.ws.gateway'
import { WebsocketEvents } from '../src/system/utils/enums/websocketEvents.enum'
import { authUser, initApp, prepareForChat } from './helpers'
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
        const createChatInput = await prepareForChat(app, horecaAuth.accessToken, providerAuth.accessToken)

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

        horecaWsClient.emit(WebsocketEvents.CHAT, createChatInput)

        expect.assertions(2)

        return new Promise<void>(resolve => {
            providerWsClient.on(WebsocketEvents.MESSAGE, data => {
                expect(data.message).toBe('Chat is created')

                providerWsClient.emit(WebsocketEvents.MESSAGE, {
                    chatId: data.chatId,
                    message: 'Hi!',
                    authorId: data.opponentId,
                })

                horecaWsClient.on(WebsocketEvents.MESSAGE, data => {
                    const res = expect(data.message).toBe('Hi!')

                    horecaWsClient.disconnect()
                    providerWsClient.disconnect()
                    resolve(res)
                })
            })
        })
    })
})
