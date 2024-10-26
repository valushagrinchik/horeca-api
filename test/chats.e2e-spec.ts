import { INestApplication } from '@nestjs/common'
import { io } from 'socket.io-client'
import { ChatWsGateway } from '../src/chat/chat.ws.gateway'
import { WebsocketEvents } from '../src/system/utils/enums/websocketEvents.enum'
import {
    addFavourites,
    approveProviderRequest,
    authUser,
    createChat,
    createHorecaRequest,
    createProviderRequest,
    getChat,
    getChatMessages,
    getChats,
    getProfile,
    initApp,
} from './helpers'
import { AuthResultDto } from '../src/users/dto/auth.result.dto'
import { horecaUserInput, providerUserInput } from './mock/seedData'
import { ChatType } from '@prisma/client'
import { ENDPOINTS } from './constants'
import { generateAcceptUntil } from '../src/system/utils/date'
import { Categories } from '../src/system/utils/enums'
import { HorecaRequestDto } from '../src/horecaRequests/dto/horecaRequest.dto'
import { ProviderRequestDto } from '../src/providerRequests/dto/providerRequest.dto'
import { UserDto } from '../src/users/dto/user.dto'
import { ChatDto } from '../src/chat/dto/chat.dto'
import { ErrorCodes } from '../src/system/utils/enums/errorCodes.enum'

let app: INestApplication
let gateway: ChatWsGateway
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let provider: UserDto
let horeca: UserDto

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        gateway = tm.get<ChatWsGateway>(ChatWsGateway)
    })

    horecaAuth = await authUser(app, horecaUserInput)
    providerAuth = await authUser(app, providerUserInput)
    provider = await getProfile(app, providerAuth.accessToken)
    horeca = await getProfile(app, horecaAuth.accessToken)
})

afterAll(async () => {
    await app.close()
})

describe('ChatWsGateway (e2e)', () => {
    it('ChatWsGateway be defined', () => {
        expect(gateway).toBeDefined()
    })

    describe('POST ' + ENDPOINTS.CHATS, () => {
        describe(`with type=${ChatType.Order}`, () => {
            let horecaRequest: HorecaRequestDto
            let providerRequest: ProviderRequestDto

            let chat: ChatDto

            beforeAll(async () => {
                const validAcceptUntill = generateAcceptUntil()
                horecaRequest = await createHorecaRequest(app, horecaAuth.accessToken, {
                    items: [
                        {
                            name: 'string',
                            amount: 10,
                            unit: 'string',
                            category: Categories.alcoholicDrinks,
                        },
                    ],
                    address: 'string',
                    deliveryTime: validAcceptUntill,
                    acceptUntill: validAcceptUntill,
                    paymentType: 'Prepayment',
                    name: 'string',
                    phone: 'string',
                    comment: 'string',
                })
                providerRequest = await createProviderRequest(app, providerAuth.accessToken, {
                    horecaRequestId: horecaRequest.id,
                    comment: 'string',
                    items: [
                        {
                            available: true,
                            manufacturer: 'string',
                            cost: 2000,
                            horecaRequestItemId: horecaRequest.items[0].id,
                        },
                    ],
                })
            })
            it('should thow an error in case chat is not allowed', async () => {
                const res = await createChat(app, horecaAuth.accessToken, {
                    opponentId: provider.id,
                    horecaRequestId: horecaRequest.id,
                    type: ChatType.Order,
                })

                expect(res.statusCode).toEqual(400)
                expect(res.errorMessage).toEqual(ErrorCodes.FORBIDDEN_ACTION)
                return
            })

            it('should return chat', async () => {
                await approveProviderRequest(app, horecaAuth.accessToken, {
                    horecaRequestId: horecaRequest.id,
                    providerRequestId: providerRequest.id,
                })
                chat = await createChat(app, horecaAuth.accessToken, {
                    opponentId: provider.id,
                    horecaRequestId: horecaRequest.id,
                    type: ChatType.Order,
                })
                expect(chat).toHaveProperty('id')
                expect(chat.opponents).toEqual([horeca.id, provider.id])
                return
            })

            it('should be possible for opponents to communicate with each other', async () => {
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
                        expect(data.message).toBe('Hi!')

                        horecaWsClient.emit(WebsocketEvents.MESSAGE, {
                            chatId: chat.id,
                            message: 'Hello!',
                            authorId: horeca.id,
                        })
                    })
                })
            })
        })
        describe(`with type=${ChatType.Private}`, () => {
            let chat: ChatDto

            it('should thow an error in case chat is not allowed', async () => {
                const res = await createChat(app, horecaAuth.accessToken, {
                    opponentId: provider.id,
                    type: ChatType.Private,
                })

                expect(res.statusCode).toEqual(400)
                expect(res.errorMessage).toEqual(ErrorCodes.FORBIDDEN_ACTION)
                return
            })

            it('should return chat', async () => {
                await addFavourites(app, horecaAuth.accessToken, {
                    providerId: provider.id,
                })
                chat = await createChat(app, horecaAuth.accessToken, {
                    opponentId: provider.id,
                    type: ChatType.Private,
                })
                expect(chat).toHaveProperty('id')
                expect(chat.opponents).toEqual([horeca.id, provider.id])
                return
            })

            it('should be possible for opponents to communicate with each other', async () => {
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
                        expect(data.message).toBe('Hi!')

                        horecaWsClient.emit(WebsocketEvents.MESSAGE, {
                            chatId: chat.id,
                            message: 'Hello!',
                            authorId: horeca.id,
                        })
                    })
                })
            })
        })
        describe(`with type=${ChatType.Support}`, () => {})
    })

    describe('GET ' + ENDPOINTS.CHATS, () => {
        it(`should return paginated data and total`, async () => {
            const res = await getChats(app, horecaAuth.accessToken)

            expect(res).toHaveProperty('data')
            expect(res).toHaveProperty('total')

            expect(res.data.length).toEqual(2)
        })
        describe('for Horeca', () => {
            it(`should return all user\'s chats`, async () => {
                const res = await getChats(app, horecaAuth.accessToken)
                expect(res.data.length).toEqual(2)
            })
        })
        describe('for Provider', () => {
            it(`should return all user\'s chats`, async () => {
                const res = await getChats(app, providerAuth.accessToken)
                expect(res.data.length).toEqual(2)
            })
        })
    })

    describe('GET ' + ENDPOINTS.CHAT, () => {
        it(`should return chat`, async () => {
            const chatRes = await getChats(app, providerAuth.accessToken)

            const res = await getChat(app, horecaAuth.accessToken, chatRes.data[0].id)

            expect(res).toHaveProperty('messages')
            expect(res).toHaveProperty('opponents')
            expect(res).toHaveProperty('id')
        })
    })

    describe('GET ' + ENDPOINTS.CHAT_MESSAGES, () => {
        it(`should return paginated data and total`, async () => {
            const chatRes = await getChats(app, providerAuth.accessToken)

            const res = await getChatMessages(app, horecaAuth.accessToken, chatRes.data[0].id)

            expect(res).toHaveProperty('data')
            expect(res).toHaveProperty('total')

            expect(res.data.length).toBeGreaterThan(0)
        })
    })

})
