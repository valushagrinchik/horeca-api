import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { AuthorizationService } from './authorization.service'
import { MailService } from '../../mail/mail.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { MailModule } from '../../mail/mail.module'
import { DatabaseService } from '../../system/database/database.service'

const prismaMock = {
    user: {
        findUnique: jest.fn(),
    },
}

describe('UsersService', () => {
    let usersService: UsersService
    let authorizationService: AuthorizationService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthorizationService,
                MailService,
                UsersService,
                {
                    provide: DatabaseService,
                    useValue: prismaMock,
                },
                Logger,
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

        usersService = module.get<UsersService>(UsersService)
        authorizationService = module.get<AuthorizationService>(AuthorizationService)

        prismaMock.user.findUnique.mockClear()
    })

    describe('get', () => {
        it('should return user if exists', async () => {
            const existingUser = {
                id: 123,
                username: 'existing-user',
                name: 'Existing User',
            }

            prismaMock.user.findUnique.mockResolvedValue(existingUser)

            const result = await usersService.get({ id: existingUser.id })
            expect(result).toEqual(existingUser)
            expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1)
            expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                where: { id: existingUser.id },
                include: { profile: { include: { addresses: true } } },
            })
        })
    })
})
