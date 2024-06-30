import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { PrismaService } from '../prisma.service'

const prismaMock = {
    user: {
        findUnique: jest.fn(),
    },
}

describe('UsersService', () => {
    let usersService: UsersService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: prismaMock,
                },
            ],
        }).compile()

        usersService = module.get<UsersService>(UsersService)

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
                where: { username: existingUser.username },
            })
        })
    })
})
