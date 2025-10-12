import { INestApplication } from '@nestjs/common'
import { 
    authUser, 
    getProfile, 
    initApp, 
    ioClient, 
    createHorecaRequest, 
    createProviderRequest, 
    approveProviderRequest,
    createChat,
    addFavourites
} from './helpers'
import { AuthResultDto } from '../src/auth/dto/auth.result.dto'
import { horecaRequestInput, horecaUserInput, providerUserInput, adminUserInput } from './mock/seedData'
import { UserDto } from '../src/users/dto/user.dto'
import { NotificationWsGateway } from '@/notifications/notification.ws.gateway'
import { NotificationEvents, Categories, generateFutureDate } from '@/shared/utils'
import { HorecaRequestsService } from '@/horecaRequests/services/horecaRequests.service'
import { ProviderRequestsService } from '@/providerRequests/services/providerRequests.service'
import { ChatWsGateway } from '@/chat/chat.ws.gateway'
import { DatabaseService } from '@/system/database/database.service'
import { ChatType, PaymentType } from '@prisma/client'
import { HorecaRequestDto } from '@/horecaRequests/dto/horecaRequest.dto'
import { ProviderRequestDto } from '@/providerRequests/dto/providerRequest.dto'
import { ChatDto } from '@/chat/dto/chat.dto'

let app: INestApplication
let notificationGateway: NotificationWsGateway
let horecaRequestsService: HorecaRequestsService
let providerRequestsService: ProviderRequestsService
let chatGateway: ChatWsGateway
let db: DatabaseService

let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let adminAuth: AuthResultDto
let horeca: UserDto
let provider: UserDto
let admin: UserDto

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        notificationGateway = tm.get<NotificationWsGateway>(NotificationWsGateway)
        horecaRequestsService = tm.get<HorecaRequestsService>(HorecaRequestsService)
        providerRequestsService = tm.get<ProviderRequestsService>(ProviderRequestsService)
        chatGateway = tm.get<ChatWsGateway>(ChatWsGateway)
        db = tm.get<DatabaseService>(DatabaseService)
    })

    horecaAuth = await authUser(app, horecaUserInput)
    providerAuth = await authUser(app, providerUserInput)
    adminAuth = await authUser(app, adminUserInput)

    horeca = await getProfile(app, horecaAuth.accessToken)
    provider = await getProfile(app, providerAuth.accessToken)
    admin = await getProfile(app, adminAuth.accessToken)
})

afterAll(async () => {
    await app.close()
})

describe('NotificationWsGateway - All sendNotification Cases (e2e)', () => {
    it('NotificationWsGateway should be defined', () => {
        expect(notificationGateway).toBeDefined()
        expect(horecaRequestsService).toBeDefined()
        expect(providerRequestsService).toBeDefined()
        expect(chatGateway).toBeDefined()
    })

    describe('NEW_HORECA_REQUEST notifications', () => {
        it('should send notification to matched providers when horeca request is created', async () => {
            const providerWsClient = ioClient('notifications', providerAuth.accessToken)
            
            const notificationPromise = new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    providerWsClient.disconnect()
                    reject(new Error('Timeout: NEW_HORECA_REQUEST notification not received'))
                }, 10000)

                providerWsClient.on('connect', () => {
                    console.log('Provider connected for NEW_HORECA_REQUEST test')
                })

                providerWsClient.on(NotificationEvents.NEW_HORECA_REQUEST, (data) => {
                    console.log('Received NEW_HORECA_REQUEST notification:', data)
                    try {
                        expect(data.data.hRequestId).toBeDefined()
                        expect(data.data.hProviderId).toBe(provider.id)
                        clearTimeout(timeout)
                        providerWsClient.disconnect()
                        resolve()
                    } catch (error) {
                        clearTimeout(timeout)
                        providerWsClient.disconnect()
                        reject(error)
                    }
                })

                providerWsClient.on('error', (err) => {
                    clearTimeout(timeout)
                    reject(err)
                })
            })

            providerWsClient.connect()

            // Wait for connection then create horeca request
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const horecaRequest = await createHorecaRequest(app, horecaAuth.accessToken, {
                ...horecaRequestInput,
                items: [{
                    name: 'Test Item',
                    amount: 10,
                    unit: 'kg',
                    category: Categories.alcoholicDrinks,
                }]
            })

            expect(horecaRequest).toBeDefined()
            return notificationPromise
        }, 15000)
    })

    describe('NEW_PROVIDER_REQUEST notifications', () => {
        let horecaRequest: HorecaRequestDto

        beforeAll(async () => {
            const acceptUntill = generateFutureDate()
            const deliveryTime = generateFutureDate(14)

            horecaRequest = await createHorecaRequest(app, horecaAuth.accessToken, {
                items: [{
                    name: 'Test Item for Provider Request',
                    amount: 5,
                    unit: 'pieces',
                    category: Categories.meat,
                }],
                address: 'Test Address',
                deliveryTime,
                acceptUntill,
                paymentType: 'Prepayment',
                name: 'Test Request',
                phone: '+1234567890',
                comment: 'Test comment',
            })
        })

        it('should send notification to horeca when provider creates request', async () => {
            const horecaWsClient = ioClient('notifications', horecaAuth.accessToken)
            
            const notificationPromise = new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    horecaWsClient.disconnect()
                    reject(new Error('Timeout: NEW_PROVIDER_REQUEST notification not received'))
                }, 10000)

                horecaWsClient.on('connect', () => {
                    console.log('Horeca connected for NEW_PROVIDER_REQUEST test')
                })

                horecaWsClient.on(NotificationEvents.NEW_PROVIDER_REQUEST, (data) => {
                    console.log('Received NEW_PROVIDER_REQUEST notification:', data)
                    try {
                        expect(data.data.hRequestId).toBe(horecaRequest.id)
                        expect(data.data.pRequestId).toBeDefined()
                        clearTimeout(timeout)
                        horecaWsClient.disconnect()
                        resolve()
                    } catch (error) {
                        clearTimeout(timeout)
                        horecaWsClient.disconnect()
                        reject(error)
                    }
                })

                horecaWsClient.on('error', (err) => {
                    clearTimeout(timeout)
                    reject(err)
                })
            })

            horecaWsClient.connect()

            // Wait for connection then create provider request
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const providerRequest = await createProviderRequest(app, providerAuth.accessToken, {
                horecaRequestId: horecaRequest.id,
                comment: 'Test provider request',
                items: [{
                    available: true,
                    manufacturer: 'Test Manufacturer',
                    cost: 1000,
                    horecaRequestItemId: horecaRequest.items[0].id,
                }]
            })

            expect(providerRequest).toBeDefined()
            return notificationPromise
        }, 15000)
    })

    describe('PROVIDER_APPROVED notifications', () => {
        let horecaRequest: HorecaRequestDto
        let providerRequest: ProviderRequestDto

        beforeAll(async () => {
            const acceptUntill = generateFutureDate()
            const deliveryTime = generateFutureDate(14)

            horecaRequest = await createHorecaRequest(app, horecaAuth.accessToken, {
                items: [{
                    name: 'Test Item for Approval',
                    amount: 3,
                    unit: 'boxes',
                    category: Categories.confectionery,
                }],
                address: 'Approval Test Address',
                deliveryTime,
                acceptUntill,
                paymentType: PaymentType.Prepayment,
                name: 'Approval Test Request',
                phone: '+1234567891',
                comment: 'Approval test comment',
            })

            providerRequest = await createProviderRequest(app, providerAuth.accessToken, {
                horecaRequestId: horecaRequest.id,
                comment: 'Test provider request for approval',
                items: [{
                    available: true,
                    manufacturer: 'Approval Test Manufacturer',
                    cost: 2000,
                    horecaRequestItemId: horecaRequest.items[0].id,
                }]
            })
        })

        it('should send notification when provider request is approved', async () => {
            const providerWsClient = ioClient('notifications', providerAuth.accessToken)
            
            const notificationPromise = new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    providerWsClient.disconnect()
                    reject(new Error('Timeout: PROVIDER_APPROVED notification not received'))
                }, 10000)

                providerWsClient.on('connect', () => {
                    console.log('Provider connected for PROVIDER_APPROVED test')
                })

                providerWsClient.on(NotificationEvents.PROVIDER_APPROVED, (data) => {
                    console.log('Received PROVIDER_APPROVED notification:', data)
                    try {
                        expect(data.data.pRequestId).toBe(providerRequest.id)
                        expect(data.data.hRequestId).toBe(horecaRequest.id)
                        expect(data.data.status).toBe('Active')
                        clearTimeout(timeout)
                        providerWsClient.disconnect()
                        resolve()
                    } catch (error) {
                        clearTimeout(timeout)
                        providerWsClient.disconnect()
                        reject(error)
                    }
                })

                providerWsClient.on('error', (err) => {
                    clearTimeout(timeout)
                    reject(err)
                })
            })

            providerWsClient.connect()

            // Wait for connection then approve provider request
            await new Promise(resolve => setTimeout(resolve, 500))
            
            await approveProviderRequest(app, horecaAuth.accessToken, {
                horecaRequestId: horecaRequest.id,
                providerRequestId: providerRequest.id,
            })

            return notificationPromise
        }, 15000)
    })

    describe('NEW_MESSAGE notifications from chat', () => {
        let horecaRequest: HorecaRequestDto
        let providerRequest: ProviderRequestDto
        let chat: ChatDto

        beforeAll(async () => {
            const acceptUntill = generateFutureDate()
            const deliveryTime = generateFutureDate(14)

            horecaRequest = await createHorecaRequest(app, horecaAuth.accessToken, {
                items: [{
                    name: 'Chat Test Item',
                    amount: 2,
                    unit: 'liters',
                    category: Categories.softDrinks,
                }],
                address: 'Chat Test Address',
                deliveryTime,
                acceptUntill,
                paymentType: 'Prepayment',
                name: 'Chat Test Request',
                phone: '+1234567892',
                comment: 'Chat test comment',
            })

            providerRequest = await createProviderRequest(app, providerAuth.accessToken, {
                horecaRequestId: horecaRequest.id,
                comment: 'Chat test provider request',
                items: [{
                    available: true,
                    manufacturer: 'Chat Test Manufacturer',
                    cost: 500,
                    horecaRequestItemId: horecaRequest.items[0].id,
                }]
            })

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
        })

        it('should send NEW_MESSAGE notification when chat message is sent', async () => {
            const providerWsClient = ioClient('notifications', providerAuth.accessToken)
            const horecaWsClient = ioClient('chats', horecaAuth.accessToken)
            
            const notificationPromise = new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    providerWsClient.disconnect()
                    horecaWsClient.disconnect()
                    reject(new Error('Timeout: NEW_MESSAGE notification not received'))
                }, 10000)

                let connectionsReady = 0
                const checkReady = () => {
                    connectionsReady++
                    if (connectionsReady === 2) {
                        // Both clients connected, send message
                        setTimeout(() => {
                            horecaWsClient.emit('message', {
                                chatId: chat.id,
                                message: 'Test notification message',
                                authorId: horeca.id,
                            })
                        }, 100)
                    }
                }

                providerWsClient.on('connect', () => {
                    console.log('Provider connected for NEW_MESSAGE test')
                    checkReady()
                })

                horecaWsClient.on('connect', () => {
                    console.log('Horeca connected for NEW_MESSAGE test')
                    checkReady()
                })

                providerWsClient.on(NotificationEvents.NEW_MESSAGE, (data) => {
                    console.log('Received NEW_MESSAGE notification:', data)
                    try {
                        expect(data.data.chatId).toBe(chat.id)
                        clearTimeout(timeout)
                        providerWsClient.disconnect()
                        horecaWsClient.disconnect()
                        resolve()
                    } catch (error) {
                        clearTimeout(timeout)
                        providerWsClient.disconnect()
                        horecaWsClient.disconnect()
                        reject(error)
                    }
                })

                providerWsClient.on('error', (err) => {
                    clearTimeout(timeout)
                    reject(err)
                })

                horecaWsClient.on('error', (err) => {
                    clearTimeout(timeout)
                    reject(err)
                })
            })

            providerWsClient.connect()
            horecaWsClient.connect()

            return notificationPromise
        }, 15000)
    })

    describe('REVIEW notifications', () => {
        it('should send REVIEW notification for first review reminder', async () => {
            const horecaWsClient = ioClient('notifications', horecaAuth.accessToken)
            
            const notificationPromise = new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    horecaWsClient.disconnect()
                    reject(new Error('Timeout: REVIEW notification not received'))
                }, 10000)

                horecaWsClient.on('connect', () => {
                    console.log('Horeca connected for REVIEW test')
                    // Trigger review notification after connection
                    setTimeout(async () => {
                        try {
                            await horecaRequestsService.sendFirstReviewNotification()
                        } catch (error) {
                            console.error('Error sending review notification:', error)
                        }
                    }, 100)
                })

                horecaWsClient.on(NotificationEvents.REVIEW, (data) => {
                    console.log('Received REVIEW notification:', data)
                    try {
                        expect(data.data.hRequestId).toBeDefined()
                        expect(data.data.pRequestId).toBeDefined()
                        expect(data.data.chatId).toBeDefined()
                        clearTimeout(timeout)
                        horecaWsClient.disconnect()
                        resolve()
                    } catch (error) {
                        clearTimeout(timeout)
                        horecaWsClient.disconnect()
                        reject(error)
                    }
                })

                horecaWsClient.on('error', (err) => {
                    clearTimeout(timeout)
                    reject(err)
                })
            })

            horecaWsClient.connect()
            return notificationPromise
        }, 15000)

        it('should send REVIEW_REMINDER notification for second review reminder', async () => {
            const horecaWsClient = ioClient('notifications', horecaAuth.accessToken)
            
            const notificationPromise = new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    horecaWsClient.disconnect()
                    reject(new Error('Timeout: REVIEW_REMINDER notification not received'))
                }, 10000)

                horecaWsClient.on('connect', () => {
                    console.log('Horeca connected for REVIEW_REMINDER test')
                    // Trigger review reminder notification after connection
                    setTimeout(async () => {
                        try {
                            await horecaRequestsService.sendSecondReviewNotification()
                        } catch (error) {
                            console.error('Error sending review reminder notification:', error)
                        }
                    }, 100)
                })

                horecaWsClient.on(NotificationEvents.REVIEW_REMINDER, (data) => {
                    console.log('Received REVIEW_REMINDER notification:', data)
                    try {
                        expect(data.data.hRequestId).toBeDefined()
                        expect(data.data.pRequestId).toBeDefined()
                        expect(data.data.chatId).toBeDefined()
                        clearTimeout(timeout)
                        horecaWsClient.disconnect()
                        resolve()
                    } catch (error) {
                        clearTimeout(timeout)
                        horecaWsClient.disconnect()
                        reject(error)
                    }
                })

                horecaWsClient.on('error', (err) => {
                    clearTimeout(timeout)
                    reject(err)
                })
            })

            horecaWsClient.connect()
            return notificationPromise
        }, 15000)
    })

    describe('Server message notifications', () => {
        let chat: ChatDto

        beforeAll(async () => {
            // Create a private chat for server message testing
            const fav = await addFavourites(app, horecaAuth.accessToken, {
                providerId: provider.id,
            })
            
            chat = await createChat(app, horecaAuth.accessToken, {
                opponentId: provider.id,
                horecaFavouriteId: fav.id,
                type: ChatType.Private,
            })
        })

        it('should send NEW_MESSAGE notification when server message is sent', async () => {
            const horecaWsClient = ioClient('notifications', horecaAuth.accessToken)
            const providerWsClient = ioClient('notifications', providerAuth.accessToken)
            
            const notificationPromise = new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    horecaWsClient.disconnect()
                    providerWsClient.disconnect()
                    reject(new Error('Timeout: Server message notification not received'))
                }, 10000)

                let notificationsReceived = 0
                const checkComplete = () => {
                    notificationsReceived++
                    if (notificationsReceived === 2) {
                        clearTimeout(timeout)
                        horecaWsClient.disconnect()
                        providerWsClient.disconnect()
                        resolve()
                    }
                }

                horecaWsClient.on('connect', () => {
                    console.log('Horeca connected for server message test')
                })

                providerWsClient.on('connect', () => {
                    console.log('Provider connected for server message test')
                    // Send server message after both are connected
                    setTimeout(async () => {
                        try {
                            await chatGateway.sendServerMessage({
                                chatId: chat.id,
                                message: 'Test server message',
                                opponents: [horeca.id, provider.id]
                            })
                        } catch (error) {
                            console.error('Error sending server message:', error)
                        }
                    }, 100)
                })

                horecaWsClient.on(NotificationEvents.NEW_MESSAGE, (data) => {
                    console.log('Horeca received server message notification:', data)
                    try {
                        expect(data.data.chatId).toBe(chat.id)
                        checkComplete()
                    } catch (error) {
                        clearTimeout(timeout)
                        horecaWsClient.disconnect()
                        providerWsClient.disconnect()
                        reject(error)
                    }
                })

                providerWsClient.on(NotificationEvents.NEW_MESSAGE, (data) => {
                    console.log('Provider received server message notification:', data)
                    try {
                        expect(data.data.chatId).toBe(chat.id)
                        checkComplete()
                    } catch (error) {
                        clearTimeout(timeout)
                        horecaWsClient.disconnect()
                        providerWsClient.disconnect()
                        reject(error)
                    }
                })

                horecaWsClient.on('error', (err) => {
                    clearTimeout(timeout)
                    reject(err)
                })

                providerWsClient.on('error', (err) => {
                    clearTimeout(timeout)
                    reject(err)
                })
            })

            horecaWsClient.connect()
            providerWsClient.connect()

            return notificationPromise
        }, 15000)
    })
})
