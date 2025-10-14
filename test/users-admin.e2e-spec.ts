import { INestApplication } from '@nestjs/common'
import { 
    authUser, 
    getProfile, 
    initApp, 


    getAdminUsers,
    deleteAdminUser,
} from './helpers/api'
import { AuthResultDto } from '../src/auth/dto/auth.result.dto'
import { adminUserInput} from './mock/seedData'
import { UserDto } from '../src/users/dto/user.dto'
import { DatabaseService } from '@/system/database/database.service'
import { UsersService } from '@/users/users.service'
import { seedHorecaCompleteDataCase, cleanDatabase } from './helpers/seed'

let app: INestApplication
let adminAuth: AuthResultDto
let horecaAuth: AuthResultDto
let providerAuth: AuthResultDto
let admin: UserDto
let horeca: UserDto
let provider: UserDto
let db: DatabaseService
let usersService: UsersService

// Test user to be deleted
let testUserId

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        db = tm.get<DatabaseService>(DatabaseService)
        usersService = tm.get<UsersService>(UsersService)
    })
})

beforeEach(async () => {
    try {
        // Clean database before each test
        await cleanDatabase(db)

        // Create admin user in database first
        await db.user.create({
            data: adminUserInput
        })
        
        // Then authenticate with plain password
        adminAuth = await authUser(app, { 
            email: adminUserInput.email, 
            password: 'admin!' // Use plain password for login
        })
        
        if (!adminAuth || !adminAuth.accessToken) {
            throw new Error('Failed to authenticate admin user')
        }
        
        admin = await getProfile(app, adminAuth.accessToken)

        // Create test data
        testUserId = await seedHorecaCompleteDataCase(db)
    } catch (error) {
        console.error('Error in beforeEach setup:', error)
        throw error
    }
})

afterEach(async () => {
    try {
        // Clean up after each test to prevent interference
        await cleanDatabase(db)
    } catch (error) {
        console.error('Error in afterEach cleanup:', error)
    }
})

afterAll(async () => {
    try {
        // Ensure all database operations complete before closing
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Close database connections
        if (db) {
            await db.$disconnect()
        }
        
        // Close the app (this will also close Redis connections)
        if (app) {
            await app.close()
        }
    } catch (error) {
        console.error('Error during cleanup:', error)
    }
}, 10000) // Increase timeout to 10 seconds

describe('UsersAdminController - Delete Method (e2e)', () => {
    it('should have all required services and users defined', () => {
        expect(app).toBeDefined()
        expect(adminAuth).toBeDefined()
        expect(admin).toBeDefined()
        expect(testUserId).toBeDefined()
        expect(db).toBeDefined()
        expect(usersService).toBeDefined()
    })

    describe('DELETE /admin/users/:id', () => {
        it('should successfully delete user when called by admin', async () => {
            try {
                // Verify user exists before deletion
                const usersBefore = await getAdminUsers(app, adminAuth.accessToken)
                
                expect(usersBefore).toBeDefined()
                
                // Handle different possible response structures
                let usersArray: UserDto[]
                if (usersBefore.data) {
                    usersArray = usersBefore.data
                } else if (Array.isArray(usersBefore)) {
                    usersArray = usersBefore
                } else {
                    throw new Error(`Unexpected response structure: ${JSON.stringify(usersBefore)}`)
                }
                
                expect(Array.isArray(usersArray)).toBe(true)
                
                const userExists = usersArray.some((user: UserDto) => user.id === testUserId)
                expect(userExists).toBe(true)

                // Delete the user
                const deleteResponse = await deleteAdminUser(app, adminAuth.accessToken, testUserId)
                expect(deleteResponse).toBe(200)

                // Add small delay to ensure deletion completes
                await new Promise(resolve => setTimeout(resolve, 500))

                // Verify user is deleted from database
                const userInDb = await db.user.findUnique({ where: { id: testUserId } })
                expect(userInDb).toBeNull()

                // cascade deleted horeca requests
                const horecaRequestsInDb = await db.horecaRequest.findMany({ where: { userId: testUserId } })
                expect(horecaRequestsInDb).toHaveLength(0)

                // cascade deleted provider requests - check the test user's provider requests
                const providerRequestsInDb = await db.providerRequest.findMany({ 
                    where: { 
                        horecaRequest: { 
                            userId: testUserId 
                        } 
                    } 
                })
                expect(providerRequestsInDb).toHaveLength(0)

                const usersAfter = await getAdminUsers(app, adminAuth.accessToken)
                let usersAfterArray: UserDto[]
                if (usersAfter.data) {
                    usersAfterArray = usersAfter.data
                } else if (Array.isArray(usersAfter)) {
                    usersAfterArray = usersAfter
                } else {
                    usersAfterArray = []
                }
                
                const userStillExists = usersAfterArray.some((user: UserDto) => user.id === testUserId)
                expect(userStillExists).toBe(false)
            } catch (error) {
                console.error('Test failed with error:', error)
                console.error('Error stack:', error.stack)
                throw error
            }
        }, 15000) // 15 second timeout for the test

    })

})
