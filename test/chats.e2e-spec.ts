import { INestApplication } from '@nestjs/common'
import { io } from 'socket.io-client'
import { ChatWsGateway } from '../src/chat/chat.ws.gateway'
import { WebsocketEvents } from '../src/system/utils/enums/websocketEvents.enum'
import { initApp, prepareForChat } from './helpers'

let app: INestApplication
let gateway: ChatWsGateway

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        gateway = tm.get<ChatWsGateway>(ChatWsGateway)
    })
})

afterAll(async () => {
    await app.close()
})

describe('ChatWsGateway (e2e)', () => {
    it('ChatWsGateway be defined', () => {
        expect(gateway).toBeDefined()
    })

    it('Horeca can start chat and receive message from Provider', async () => {
        const { horecaToken, providerToken, ...createChatInput } = await prepareForChat(app)

        const horecaWsClient = io(process.env.WS_URL, {
            autoConnect: false,
            transports: ['websocket'],
            extraHeaders: { authorization: 'Bearer ' + horecaToken },
        })

        const providerWsClient = io(process.env.WS_URL, {
            autoConnect: false,
            transports: ['websocket'],
            extraHeaders: { authorization: 'Bearer ' + providerToken },
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
