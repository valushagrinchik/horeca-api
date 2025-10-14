import { INestApplication } from '@nestjs/common'
import { 
    activateUser,
    authUser, 
    getProfile, 
    initApp, 
    ioClient,
    registrateUser
} from './helpers/api'
import { AuthResultDto } from '../src/auth/dto/auth.result.dto'
import { horecaUsers, providerUsers } from './mock/authData'
import { UserDto } from '../src/users/dto/user.dto'
import { NotificationWsGateway } from '@/notifications/notification.ws.gateway'
import { NotificationEvents } from '@/shared/utils'
import { HorecaRequestsConsumerService } from '@/horecaRequests/cron/horecaRequests.consumer.service'
import { DatabaseService } from '@/system/database/database.service'
import { cleanDatabase } from './helpers/seed'

let app: INestApplication
let gateway: NotificationWsGateway
let hrConsumer: HorecaRequestsConsumerService
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let horeca: UserDto
let provider: UserDto
let db: DatabaseService

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        gateway = tm.get<NotificationWsGateway>(NotificationWsGateway)
        hrConsumer = tm.get<HorecaRequestsConsumerService>(HorecaRequestsConsumerService)
        db = tm.get<DatabaseService>(DatabaseService)
    })
})

beforeEach(async () => {
    try {
        await cleanDatabase(db)
        
        // Create and activate horeca user
        const horecaUser = await registrateUser(app, horecaUsers[0])
        await activateUser(app, horecaUser.activationLink)
        horecaAuth = await authUser(app, {
            email: horecaUsers[0].email,
            password: horecaUsers[0].password
        })
        horeca = await getProfile(app, horecaAuth.accessToken)
        
        // Create and activate provider user  
        const providerUser = await registrateUser(app, providerUsers[0])
        await activateUser(app, providerUser.activationLink)
        providerAuth = await authUser(app, {
            email: providerUsers[0].email,
            password: providerUsers[0].password
        })
        provider = await getProfile(app, providerAuth.accessToken)
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

describe('NotificationWsGateway (e2e)', () => {
    it('NotificationWsGateway should be defined', () => {
        expect(gateway).toBeDefined()
    })

    it('should establish WebSocket connection', async () => {
        const providerWsClient = ioClient('notifications', providerAuth.accessToken)

        const connectionPromise = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                providerWsClient.disconnect()
                reject(new Error('Connection timeout'))
            }, 5000)

            providerWsClient.on('connect', () => {
                console.log('Connection test: Provider connected')
                clearTimeout(timeout)
                providerWsClient.disconnect()
                resolve()
            })

            providerWsClient.on('connect_error', (err) => {
                console.error('Connection test error:', err)
                clearTimeout(timeout)
                reject(err)
            })
        })

        providerWsClient.connect()
        return connectionPromise
    }, 10000)

    describe('.sendNotification', () => {
        it('should send notification to connected provider', async () => {
            const providerWsClient = ioClient('notifications', providerAuth.accessToken)

            const promise = new Promise<void>((resolve, reject) => {
                // Set up timeout to prevent hanging tests
                const timeout = setTimeout(() => {
                    providerWsClient.disconnect()
                    reject(new Error('Test timeout: WebSocket connection or notification not received'))
                }, 10000) // 10 second timeout

                providerWsClient.on('connect', () => {
                    console.log('Provider connected successfully')
                    
                    // Send notification after connection is established
                    setTimeout(() => {
                        gateway.sendNotification(
                            provider.id,
                            NotificationEvents.NEW_MESSAGE,
                            {
                                data: { chatId: 1 },
                            },
                        )
                    }, 100) // Small delay to ensure connection is fully established
                })

                providerWsClient.on('disconnect', () => {
                    console.log('Provider disconnected')
                })

                providerWsClient.on(NotificationEvents.NEW_MESSAGE, (data) => {
                    console.log('Received notification:', data)
                    try {
                        expect(data.data.chatId).toBe(1)
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
                    console.error('WebSocket error:', err)
                    clearTimeout(timeout)
                    reject(err)
                })

                providerWsClient.on('connect_error', (err) => {
                    console.error('WebSocket connection error:', err)
                    clearTimeout(timeout)
                    reject(err)
                })
            })

            // Connect after setting up all listeners
            providerWsClient.connect()
            
            return promise
        }, 15000) // Increase Jest timeout for this test
    })
})