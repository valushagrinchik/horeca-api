import { INestApplication } from '@nestjs/common'
import { io, Socket } from 'socket.io-client'
import { ChatWsGateway } from '../src/chat/chat.ws.gateway'
import { WebsocketEvents } from '../src/system/utils/enums/websocketEvents.enum'
import {
    addFavourites,
    approveProviderRequest,
    assignAdminToSupportRequest,
    authUser,
    createChat,
    createHorecaRequest,
    createProviderRequest,
    createSupportRequest,
    getChats,
    getProfile,
    initApp,
} from './helpers'
import { AuthResultDto } from '../src/users/dto/auth.result.dto'
import { adminUserInput, horecaUserInput, providerUserInput } from './mock/seedData'
import { ChatType } from '@prisma/client'
import { ENDPOINTS } from './constants'
import { generateAcceptUntil } from '../src/system/utils/date'
import { Categories } from '../src/system/utils/enums'
import { HorecaRequestDto } from '../src/horecaRequests/dto/horecaRequest.dto'
import { ProviderRequestDto } from '../src/providerRequests/dto/providerRequest.dto'
import { UserDto } from '../src/users/dto/user.dto'
import { ChatDto } from '../src/chat/dto/chat.dto'
import { SupportRequestDto } from '../src/supportRequests/dto/supportRequest.dto'
import { MESSAGES } from '../src/chat/messages'
import { FavouriteDto } from '../src/favourites/dto/favourite.dto'

let app: INestApplication
let gateway: ChatWsGateway
let adminAuth: AuthResultDto
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let provider: UserDto
let horeca: UserDto

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        gateway = tm.get<ChatWsGateway>(ChatWsGateway)
    })

    adminAuth = await authUser(app, adminUserInput)
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

    describe('POST ' + ENDPOINTS.CHAT, () => {
        describe(`with type=${ChatType.Order}`, () => {
            let horecaRequest: HorecaRequestDto
            let providerRequest: ProviderRequestDto
            let chat: ChatDto
            let horecaWsClient: Socket
            let providerWsClient: Socket

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

            beforeEach(async () => {
                horecaWsClient = io(process.env.WS_URL, {
                    autoConnect: false,
                    transports: ['websocket'],
                    extraHeaders: { authorization: 'Bearer ' + horecaAuth.accessToken },
                })

                providerWsClient = io(process.env.WS_URL, {
                    autoConnect: false,
                    transports: ['websocket'],
                    extraHeaders: { authorization: 'Bearer ' + providerAuth.accessToken },
                })
                horecaWsClient.connect()
                providerWsClient.connect()
            })
            afterEach(() => {
                horecaWsClient.disconnect()
                providerWsClient.disconnect()
            })

            it('should send server message to horeca and provider when horeca approve provider request', async () => {
                const promises = [
                    new Promise<void>(resolve => {
                        providerWsClient.on(WebsocketEvents.MESSAGE, data => {
                            const res = expect(data.message).toBe(MESSAGES.CHAT_CREATED)
                            return resolve(res)
                        })
                    }),
                    new Promise<void>(resolve => {
                        horecaWsClient.on(WebsocketEvents.MESSAGE, data => {
                            const res = expect(data.message).toBe(MESSAGES.CHAT_CREATED)
                            return resolve(res)
                        })
                    }),
                ]

                const res = await approveProviderRequest(app, horecaAuth.accessToken, {
                    horecaRequestId: horecaRequest.id,
                    providerRequestId: providerRequest.id,
                })
                
                chat = res.chat

                return Promise.all(promises)
            })

            it('should be possible for opponents to communicate with each other', async () => {
                return new Promise<void>(resolve => {
                    providerWsClient.on(WebsocketEvents.MESSAGE, data => {
                        const res = expect(data.message).toBe('Hello!')
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
            let favourite: FavouriteDto
            let chat: ChatDto
            let horecaWsClient: Socket
            let providerWsClient: Socket
            beforeEach(async () => {
                horecaWsClient = io(process.env.WS_URL, {
                    autoConnect: false,
                    transports: ['websocket'],
                    extraHeaders: { authorization: 'Bearer ' + horecaAuth.accessToken },
                })

                providerWsClient = io(process.env.WS_URL, {
                    autoConnect: false,
                    transports: ['websocket'],
                    extraHeaders: { authorization: 'Bearer ' + providerAuth.accessToken },
                })
                horecaWsClient.connect()
                providerWsClient.connect()
            })
            afterEach(() => {
                horecaWsClient.disconnect()
                providerWsClient.disconnect()
            })

            it('should send server message to horeca and provider when horeca adds provider to the favourites list', async () => {
                const promises = [
                    new Promise<void>(resolve => {
                        providerWsClient.on(WebsocketEvents.MESSAGE, data => {
                            const res = expect(data.message).toBe(MESSAGES.CHAT_CREATED)
                            return resolve(res)
                        })
                    }),
                    new Promise<void>(resolve => {
                        horecaWsClient.on(WebsocketEvents.MESSAGE, data => {
                            const res = expect(data.message).toBe(MESSAGES.CHAT_CREATED)
                            return resolve(res)
                        })
                    }),
                ]

                const res = await addFavourites(app, horecaAuth.accessToken, {
                    providerId: provider.id,
                })

                favourite = res.favourite
                chat = res.chat

                return Promise.all(promises)
            })

            it('should be possible for opponents to communicate with each other', async () => {
                return new Promise<void>(resolve => {
                    providerWsClient.on(WebsocketEvents.MESSAGE, data => {
                        const res = expect(data.message).toBe('Hello!')
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
        describe(`with type=${ChatType.Support}`, () => {
            let supportRequest: SupportRequestDto
            let chat: ChatDto
            let adminWsClient: Socket
            let providerWsClient: Socket
            beforeEach(async () => {
                adminWsClient = io(process.env.WS_URL, {
                    autoConnect: false,
                    transports: ['websocket'],
                    extraHeaders: { authorization: 'Bearer ' + adminAuth.accessToken },
                })

                providerWsClient = io(process.env.WS_URL, {
                    autoConnect: false,
                    transports: ['websocket'],
                    extraHeaders: { authorization: 'Bearer ' + providerAuth.accessToken },
                })
                adminWsClient.connect()
                providerWsClient.connect()
            })
            afterEach(() => {
                adminWsClient.disconnect()
                providerWsClient.disconnect()
            })

            it('should send server message to user on creating support request', async () => {
                const promise = new Promise<void>(resolve => {
                    providerWsClient.on(WebsocketEvents.MESSAGE, data => {
                        const res = expect(data.message).toBe(MESSAGES.SUPPORT_CHAT_CREATED)
                        return resolve(res)
                    })
                })
                const res = await createSupportRequest(app, providerAuth.accessToken, {})

                supportRequest = res.supportRequest
                chat = res.chat

                return promise
            })

            it('user and admin should receive message from admin when admin will be assigned', async () => {
                const promises = [
                    new Promise<void>(resolve => {
                        providerWsClient.on(WebsocketEvents.MESSAGE, data => {
                            const res = expect(data.message).toBe(MESSAGES.SUPPORT_CHAT_ADMIN_ASSIGNED)
                            return resolve(res)
                        })
                    }),
                    new Promise<void>(resolve => {
                        adminWsClient.on(WebsocketEvents.MESSAGE, data => {
                            const res = expect(data.message).toBe(MESSAGES.SUPPORT_CHAT_ADMIN_ASSIGNED)
                            return resolve(res)
                        })
                    }),
                ]
                await assignAdminToSupportRequest(app, adminAuth.accessToken, supportRequest.id)

                return Promise.all(promises)
            })

            it('should be possible for opponents to communicate with each other', async () => {
                return new Promise<void>(resolve => {
                    providerWsClient.on(WebsocketEvents.MESSAGE, data => {
                        const res = expect(data.message).toBe('Hello!')
                        return resolve(res)
                    })

                    providerWsClient.emit(WebsocketEvents.MESSAGE, {
                        chatId: chat.id,
                        message: 'Hi!',
                        authorId: provider.id,
                    })

                    adminWsClient.on(WebsocketEvents.MESSAGE, data => {
                        expect(data.message).toBe('Hi!')

                        adminWsClient.emit(WebsocketEvents.MESSAGE, {
                            chatId: chat.id,
                            message: 'Hello!',
                            authorId: horeca.id,
                        })
                    })
                })
            })
        })
    })

    describe('GET ' + ENDPOINTS.CHAT, () => {
        describe('for Horeca', () => {
            it(`should return all user\'s chats`, async () => {
                const chats = await getChats(app, horecaAuth.accessToken)
                expect(chats.length).toEqual(2)
            })
        })
        describe('for Provider', () => {
            it(`should return all user\'s chats`, async () => {
                const chats = await getChats(app, providerAuth.accessToken)
                expect(chats.length).toEqual(3)
            })
        })
        describe('for Admin', () => {
            it(`should return all admin\'s chats`, async () => {
                const chats = await getChats(app, adminAuth.accessToken)
                expect(chats.length).toEqual(1)
            })
        })
    })
})
