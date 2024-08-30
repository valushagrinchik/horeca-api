import { UserRole } from '@prisma/client'
import { UsersController } from './users.controller'
import { UsersService } from './services/users.service'
import { Test } from '@nestjs/testing'
import { AuthorizationService } from './authorization.service'
import { MailModule } from '../mail/mail.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { DatabaseService } from '../system/database/database.service'

describe('UsersController', () => {
    let usersController: UsersController
    let usersService: UsersService

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                UsersService,
                DatabaseService,
                AuthorizationService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            return null
                        }),
                    },
                },
            ],
            imports: [ConfigModule, MailModule, JwtModule],
        }).compile()

        usersService = moduleRef.get<UsersService>(UsersService)
        usersController = moduleRef.get<UsersController>(UsersController)
    })

    describe('findAll', () => {
        it('should return an array of cats', async () => {
            const user = {
                id: 123,
                role: UserRole.Horeca,
                name: 'Test',
                tin: 'Test',
                email: 'test@test.test',
                phone: '123',
                password: '123',
                createdAt: new Date(),
                updatedAt: new Date(),
                activationLink: '',
                isActivated: true,
                profile: null,
            }

            jest.spyOn(usersService, 'get').mockImplementation(() => Promise.resolve(user))

            expect(await usersController.get({ id: 123 })).toBe(user)
        })
    })
})
