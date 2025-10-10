import { INestApplication } from '@nestjs/common'
import { ChatWsGateway } from '../src/chat/chat.ws.gateway'
import {
    addFavourites,
    approveProviderRequest,
    assignAdminToSupportRequest,
    authUser,
    createChat,
    createHorecaRequest,
    createProviderRequest,
    createSupportRequest,
    getChat,
    getChatMessages,
    getChats,
    getProfile,
    initApp,
    ioClient,
    resolveSupportRequest,
} from './helpers'
import { AuthResultDto } from '../src/auth/dto/auth.result.dto'
import { adminUserInput, horecaUserInput, providerUserInput } from './mock/seedData'
import { ChatType } from '@prisma/client'
import { ENDPOINTS } from './constants'
import { generateFutureDate, Categories, ErrorCodes, ChatEvents } from '@/shared/utils'
import { HorecaRequestDto } from '../src/horecaRequests/dto/horecaRequest.dto'
import { ProviderRequestDto } from '../src/providerRequests/dto/providerRequest.dto'
import { UserDto } from '../src/users/dto/user.dto'
import { ChatDto } from '../src/chat/dto/chat.dto'
import { SupportRequestDto } from '../src/supportRequests/dto/supportRequest.dto'

let app: INestApplication
let gateway: ChatWsGateway
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let adminAuth: AuthResultDto
let provider: UserDto
let horeca: UserDto
let admin: UserDto

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        gateway = tm.get<ChatWsGateway>(ChatWsGateway)
    })

    horecaAuth = await authUser(app, horecaUserInput)
    providerAuth = await authUser(app, providerUserInput)
    adminAuth = await authUser(app, adminUserInput)
    provider = await getProfile(app, providerAuth.accessToken)
    horeca = await getProfile(app, horecaAuth.accessToken)
    admin = await getProfile(app, adminAuth.accessToken)
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
                const acceptUntill = generateFutureDate()
                const deliveryTime = generateFutureDate(14)

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
                    deliveryTime,
                    acceptUntill,
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

            it('horeca and provider requests exists', async () => {
                expect(horecaRequest).toHaveProperty('id')
                expect(providerRequest).toHaveProperty('id')
            })

            it('should thow an error in case chat is not allowed', async () => {
                const res = await createChat(app, horecaAuth.accessToken, {
                    opponentId: provider.id,
                    horecaRequestId: horecaRequest.id,
                    providerRequestId: providerRequest.id,
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
                    providerRequestId: providerRequest.id,
                    type: ChatType.Order,
                })
                const chatDetails = await getChat(app, horecaAuth.accessToken, chat.id)
                expect(chatDetails.providerId).not.toBeNull()

                expect(chat).toHaveProperty('id')
                expect(chat.opponents).toEqual([horeca.id, provider.id])
                return
            })

            it('should be possible for opponents to communicate with each other', async () => {
                const horecaWsClient = ioClient('chats', horecaAuth.accessToken)
                const providerWsClient = ioClient('chats', providerAuth.accessToken)

                expect.assertions(2)

                return new Promise<void>((resolve, reject) => {
                    let horecaConnected = false
                    let providerConnected = false
                    let conversationStarted = false

                    const timeout = setTimeout(() => {
                        horecaWsClient.disconnect()
                        providerWsClient.disconnect()
                        reject(new Error('Test timeout: WebSocket communication failed'))
                    }, 15000)

                    const startConversation = () => {
                        if (horecaConnected && providerConnected && !conversationStarted) {
                            conversationStarted = true
                            setTimeout(() => {
                                providerWsClient.emit(ChatEvents.MESSAGE, {
                                    chatId: chat.id,
                                    message: 'Hi!',
                                    authorId: provider.id,
                                })
                            }, 100)
                        }
                    }

                    horecaWsClient.on('connect', () => {
                        console.log('Horeca connected to order chat')
                        horecaConnected = true
                        startConversation()
                    })

                    providerWsClient.on('connect', () => {
                        console.log('Provider connected to order chat')
                        providerConnected = true
                        startConversation()
                    })

                    providerWsClient.on(ChatEvents.MESSAGE, data => {
                        console.log('Provider received order message:', data.message)
                        try {
                            expect(data.message).toBe('Hello!')
                            clearTimeout(timeout)
                            horecaWsClient.disconnect()
                            providerWsClient.disconnect()
                            resolve()
                        } catch (error) {
                            clearTimeout(timeout)
                            horecaWsClient.disconnect()
                            providerWsClient.disconnect()
                            reject(error)
                        }
                    })

                    horecaWsClient.on(ChatEvents.MESSAGE, data => {
                        console.log('Horeca received order message:', data.message)
                        try {
                            expect(data.message).toBe('Hi!')
                            setTimeout(() => {
                                horecaWsClient.emit(ChatEvents.MESSAGE, {
                                    chatId: chat.id,
                                    message: 'Hello!',
                                    authorId: horeca.id,
                                })
                            }, 100)
                        } catch (error) {
                            clearTimeout(timeout)
                            horecaWsClient.disconnect()
                            providerWsClient.disconnect()
                            reject(error)
                        }
                    })

                    horecaWsClient.on('error', (err) => {
                        console.error('Horeca order chat WebSocket error:', err)
                        clearTimeout(timeout)
                        reject(err)
                    })

                    providerWsClient.on('error', (err) => {
                        console.error('Provider order chat WebSocket error:', err)
                        clearTimeout(timeout)
                        reject(err)
                    })

                    horecaWsClient.on('connect_error', (err) => {
                        console.error('Horeca order chat connection error:', err)
                        clearTimeout(timeout)
                        reject(err)
                    })

                    providerWsClient.on('connect_error', (err) => {
                        console.error('Provider order chat connection error:', err)
                        clearTimeout(timeout)
                        reject(err)
                    })

                    // Connect after setting up all listeners
                    horecaWsClient.connect()
                    providerWsClient.connect()
                })
            }, 20000)



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
                const fav = await addFavourites(app, horecaAuth.accessToken, {
                    providerId: provider.id,
                })
                chat = await createChat(app, horecaAuth.accessToken, {
                    opponentId: provider.id,
                    horecaFavouriteId: fav.id,
                    type: ChatType.Private,
                })
                const chatDetails = await getChat(app, horecaAuth.accessToken, chat.id)

                expect(chatDetails.horecaFavourites).not.toBeNull()
                expect(chat).toHaveProperty('id')
                expect(chat.opponents).toEqual([horeca.id, provider.id])
                return
            })

            it('should be possible for opponents to communicate with each other', async () => {
                const horecaWsClient = ioClient('chats', horecaAuth.accessToken)
                const providerWsClient = ioClient('chats', providerAuth.accessToken)

                expect.assertions(2)

                return new Promise<void>((resolve, reject) => {
                    let horecaConnected = false
                    let providerConnected = false
                    let conversationStarted = false

                    const timeout = setTimeout(() => {
                        horecaWsClient.disconnect()
                        providerWsClient.disconnect()
                        reject(new Error('Test timeout: WebSocket communication failed'))
                    }, 15000)

                    const startConversation = () => {
                        if (horecaConnected && providerConnected && !conversationStarted) {
                            conversationStarted = true
                            setTimeout(() => {
                                providerWsClient.emit(ChatEvents.MESSAGE, {
                                    chatId: chat.id,
                                    message: 'Hi!',
                                    authorId: provider.id,
                                })
                            }, 100)
                        }
                    }

                    horecaWsClient.on('connect', () => {
                        console.log('Horeca connected to private chat')
                        horecaConnected = true
                        startConversation()
                    })

                    providerWsClient.on('connect', () => {
                        console.log('Provider connected to private chat')
                        providerConnected = true
                        startConversation()
                    })

                    providerWsClient.on(ChatEvents.MESSAGE, data => {
                        console.log('Provider received private message:', data.message)
                        try {
                            expect(data.message).toBe('Hello!')
                            clearTimeout(timeout)
                            horecaWsClient.disconnect()
                            providerWsClient.disconnect()
                            resolve()
                        } catch (error) {
                            clearTimeout(timeout)
                            horecaWsClient.disconnect()
                            providerWsClient.disconnect()
                            reject(error)
                        }
                    })

                    horecaWsClient.on(ChatEvents.MESSAGE, data => {
                        console.log('Horeca received private message:', data.message)
                        try {
                            expect(data.message).toBe('Hi!')
                            setTimeout(() => {
                                horecaWsClient.emit(ChatEvents.MESSAGE, {
                                    chatId: chat.id,
                                    message: 'Hello!',
                                    authorId: horeca.id,
                                })
                            }, 100)
                        } catch (error) {
                            clearTimeout(timeout)
                            horecaWsClient.disconnect()
                            providerWsClient.disconnect()
                            reject(error)
                        }
                    })

                    horecaWsClient.on('error', (err) => {
                        console.error('Horeca private chat WebSocket error:', err)
                        clearTimeout(timeout)
                        reject(err)
                    })

                    providerWsClient.on('error', (err) => {
                        console.error('Provider private chat WebSocket error:', err)
                        clearTimeout(timeout)
                        reject(err)
                    })

                    horecaWsClient.on('connect_error', (err) => {
                        console.error('Horeca private chat connection error:', err)
                        clearTimeout(timeout)
                        reject(err)
                    })

                    providerWsClient.on('connect_error', (err) => {
                        console.error('Provider private chat connection error:', err)
                        clearTimeout(timeout)
                        reject(err)
                    })

                    // Connect after setting up all listeners
                    horecaWsClient.connect()
                    providerWsClient.connect()
                })
            }, 20000)
        })
        describe(`with type=${ChatType.Support}`, () => {
            let chat: ChatDto
            let supportRequest: SupportRequestDto

            beforeAll(async () => {
                supportRequest = await createSupportRequest(app, providerAuth.accessToken, {
                    content: 'I need help!',
                })
            })

            afterAll(async () => {
                await resolveSupportRequest(app, providerAuth.accessToken, supportRequest.id)
            })

            it('should thow an error in case chat is not allowed', async () => {
                const res = await createChat(app, adminAuth.accessToken, {
                    opponentId: provider.id,
                    supportRequestId: 10,
                    type: ChatType.Support,
                })

                expect(res.statusCode).toEqual(400)
                expect(res.errorMessage).toEqual(ErrorCodes.FORBIDDEN_ACTION)
                return
            })

            it('should return chat', async () => {
                await assignAdminToSupportRequest(app, adminAuth.accessToken, supportRequest.id)

                chat = await createChat(app, adminAuth.accessToken, {
                    opponentId: provider.id,
                    supportRequestId: supportRequest.id,
                    type: ChatType.Support,
                })

                const chatDetails = await getChat(app, adminAuth.accessToken, chat.id)

                expect(chatDetails.messages[0].message).toBe(supportRequest.content)
                expect(chatDetails.supportRequest).not.toBeNull()
                expect(chat).toHaveProperty('id')
                expect(chat.opponents).toEqual([admin.id, provider.id])
                return
            })

            it('should be possible for opponents to communicate with each other', async () => {
                const adminWsClient = ioClient('chats', adminAuth.accessToken)
                const providerWsClient = ioClient('chats', providerAuth.accessToken)

                expect.assertions(2)

                return new Promise<void>((resolve, reject) => {
                    let adminConnected = false
                    let providerConnected = false
                    let conversationStarted = false

                    const timeout = setTimeout(() => {
                        adminWsClient.disconnect()
                        providerWsClient.disconnect()
                        reject(new Error('Test timeout: WebSocket communication failed'))
                    }, 15000)

                    const startConversation = () => {
                        if (adminConnected && providerConnected && !conversationStarted) {
                            conversationStarted = true
                            setTimeout(() => {
                                providerWsClient.emit(ChatEvents.MESSAGE, {
                                    chatId: chat.id,
                                    message: 'Hi!',
                                    authorId: provider.id,
                                })
                            }, 100)
                        }
                    }

                    adminWsClient.on('connect', () => {
                        console.log('Admin connected to support chat')
                        adminConnected = true
                        startConversation()
                    })

                    providerWsClient.on('connect', () => {
                        console.log('Provider connected to support chat')
                        providerConnected = true
                        startConversation()
                    })

                    providerWsClient.on(ChatEvents.MESSAGE, data => {
                        console.log('Provider received support message:', data.message)
                        try {
                            expect(data.message).toBe('Hello!')
                            clearTimeout(timeout)
                            adminWsClient.disconnect()
                            providerWsClient.disconnect()
                            resolve()
                        } catch (error) {
                            clearTimeout(timeout)
                            adminWsClient.disconnect()
                            providerWsClient.disconnect()
                            reject(error)
                        }
                    })

                    adminWsClient.on(ChatEvents.MESSAGE, data => {
                        console.log('Admin received support message:', data.message)
                        try {
                            expect(data.message).toBe('Hi!')
                            setTimeout(() => {
                                adminWsClient.emit(ChatEvents.MESSAGE, {
                                    chatId: chat.id,
                                    message: 'Hello!',
                                    authorId: admin.id,
                                })
                            }, 100)
                        } catch (error) {
                            clearTimeout(timeout)
                            adminWsClient.disconnect()
                            providerWsClient.disconnect()
                            reject(error)
                        }
                    })

                    adminWsClient.on('error', (err) => {
                        console.error('Admin support chat WebSocket error:', err)
                        clearTimeout(timeout)
                        reject(err)
                    })

                    providerWsClient.on('error', (err) => {
                        console.error('Provider support chat WebSocket error:', err)
                        clearTimeout(timeout)
                        reject(err)
                    })

                    adminWsClient.on('connect_error', (err) => {
                        console.error('Admin support chat connection error:', err)
                        clearTimeout(timeout)
                        reject(err)
                    })

                    providerWsClient.on('connect_error', (err) => {
                        console.error('Provider support chat connection error:', err)
                        clearTimeout(timeout)
                        reject(err)
                    })

                    // Connect after setting up all listeners
                    adminWsClient.connect()
                    providerWsClient.connect()
                })
            }, 20000)
        })
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
                return
            })
        })
        describe('for Provider', () => {
            it(`should return all user\'s chats`, async () => {
                const res = await getChats(app, providerAuth.accessToken)
                expect(res.data.length).toEqual(3)
                return
            })
        })
        describe('for Admin', () => {
            it(`should return all user\'s chats`, async () => {
                const res = await getChats(app, adminAuth.accessToken)
                expect(res.data.length).toEqual(1)
                return
            })
        })
    })

    describe('GET ' + ENDPOINTS.CHAT, () => {
        it(`should return chat`, async () => {
            const chatRes = await getChats(app, providerAuth.accessToken)
            const orderChat = chatRes.data.find(chat => chat.type == ChatType.Order)
            const res = await getChat(app, horecaAuth.accessToken, orderChat.id)

            expect(res.type).toBe(ChatType.Order)
            expect(res.providerRequest).not.toBeNull()
            expect(res.providerRequest.horecaRequest).not.toBeNull()
            expect(res.providerRequest.horecaRequest.reviewNotificationSent).toBeFalsy()
            expect(res.providerRequest.providerRequestReview).toBeNull()

            expect(res).toHaveProperty('messages')
            expect(res).toHaveProperty('opponents')
            expect(res).toHaveProperty('id')
            return
        })
    })

    describe('GET ' + ENDPOINTS.CHAT_MESSAGES, () => {
        it(`should return paginated data and total`, async () => {
            const chatRes = await getChats(app, providerAuth.accessToken)
            const res = await getChatMessages(app, horecaAuth.accessToken, chatRes.data.find(chat => chat.type == ChatType.Order).id)

            expect(res).toHaveProperty('data')
            expect(res).toHaveProperty('total')

            expect(res.data.length).toBeGreaterThan(0)
            return
        })
    })
})
