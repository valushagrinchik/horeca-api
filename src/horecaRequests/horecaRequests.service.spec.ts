import { Test } from '@nestjs/testing'
import { PrismaService } from '../prisma.service'
import { PaymentType, ProfileType, User, UserRole } from '@prisma/client'
import { Categories } from '../system/enums'
import { HorecaRequestsService } from './HorecaRequests.service'

describe('ProposalsProviderService', () => {
    let service: HorecaRequestsService
    let prismaService: PrismaService

    let horecaUser: User
    let horecaUser2: User
    let providerUser: User

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [HorecaRequestsService, PrismaService],
        }).compile()

        service = module.get<HorecaRequestsService>(HorecaRequestsService)
        prismaService = module.get<PrismaService>(PrismaService)
    })

    beforeAll(async () => {
        const data = {
            horecaUsers: [
                {
                    name: 'Horeca1',
                    email: 'horeca1@test.com',
                    password: 'test',
                    tin: 'test',
                    role: UserRole.Horeca,
                    profile: {
                        profileType: ProfileType.Horeca,
                    },
                },
                {
                    name: 'Horeca2',
                    email: 'horeca2@test.com',
                    password: 'test',
                    tin: 'test',
                    role: UserRole.Horeca,
                    profile: {
                        profileType: ProfileType.Horeca,
                    },
                },
            ],
            providerUsers: [
                {
                    name: 'Test',
                    email: 'test@test.com',
                    password: 'test',
                    tin: 'test',
                    role: UserRole.Provider,
                    profile: {
                        create: {
                            profileType: ProfileType.Provider,
                            categories: [Categories.alcoholicDrinks, Categories.bakeryProducts],
                        },
                    },
                },
            ],
        }

        // Horeca profiles
        const [horecaUser, horecaUser2] = await Promise.all(
            data.horecaUsers.map(async user =>
                prismaService.user.create({
                    data: { ...user, profile: { create: user.profile } },
                })
            )
        )

        // Provider profile
        providerUser = await prismaService.user.create({
            data: data.providerUsers[0],
        })

        const now = new Date()
        const validAcceptUntill = new Date()
        validAcceptUntill.setDate(now.getDate() + 7)
        validAcceptUntill.setUTCHours(0, 0, 0, 0)

        const invalidAcceptUntill = new Date()
        invalidAcceptUntill.setDate(now.getDate() - 7)
        invalidAcceptUntill.setUTCHours(0, 0, 0, 0)

        // create products
        await prismaService.horecaRequest.create({
            data: {
                name: 'Something delishious',
                profileId: horecaUser.id,
                deliveryTime: validAcceptUntill,
                acceptUntill: validAcceptUntill,
                paymentType: PaymentType.PaymentUponDelivery,
                address: 'test',
                phone: 'test',
                items: {
                    createMany: {
                        data: [
                            {
                                name: 'cake',
                                amount: 50,
                                unit: 'kg',
                                category: Categories.bakeryProducts,
                            },
                            {
                                name: 'bananas',
                                amount: 50,
                                unit: 'kg',
                                category: Categories.fruitsAndVegetables,
                            },
                            {
                                name: 'beer',
                                amount: 50,
                                unit: 'items',
                                category: Categories.alcoholicDrinks,
                            },
                        ],
                    },
                },
            },
        })

        await prismaService.horecaRequest.create({
            data: {
                name: 'Something delishious2',
                profileId: horecaUser2.id,
                deliveryTime: invalidAcceptUntill,
                acceptUntill: invalidAcceptUntill,
                paymentType: PaymentType.PaymentUponDelivery,
                address: 'test',
                phone: 'test',
                items: {
                    createMany: {
                        data: [
                            {
                                name: 'cake big',
                                amount: 50,
                                unit: 'kg',
                                category: Categories.bakeryProducts,
                            },
                        ],
                    },
                },
            },
        })
    })

    describe('findAppropriateProposals', () => {
        it('should return all appropriate horeca proposals for provider', async () => {
            const response = await service.find({ id: providerUser.id })
            expect(response.length).toBe(1)
            expect(response[0].name).toBe('Something delishious')
        })
    })
})
