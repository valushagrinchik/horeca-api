import { PaymentType, PrismaClient, ProductPackagingType, ProfileType, UserRole } from '@prisma/client'
import { Categories, DeliveryMethods } from '../src/utils/enums'
import { generatePassword } from '../src/utils/crypto'

import * as dotenv from 'dotenv'
dotenv.config()

const generateAcceptUntil = () => {
    const now = new Date()
    const validAcceptUntill = new Date()
    validAcceptUntill.setDate(now.getDate() + 7)
    validAcceptUntill.setUTCHours(0, 0, 0, 0)
    return validAcceptUntill
}

const prisma = new PrismaClient()
async function main() {
    const horeca = await prisma.user.upsert({
        where: { email: 'horeca@test.com' },
        update: {},
        create: {
            email: 'horeca@test.com',
            password: generatePassword('horeca!'),
            activationLink: 'Horeca',
            isActivated: true,
            name: 'Horeca',
            tin: 'horeca',
            role: UserRole.Horeca,
            phone: '123123123',
            profile: {
                create: {
                    profileType: ProfileType.Horeca,
                    info: 'info',
                    addresses: {
                        createMany: {
                            data: [
                                {
                                    address: 'address1',
                                    // Monday
                                    moFrom: '12:00',
                                    moTo: '16:00',
                                    // Tuesday
                                    tuFrom: '12:00',
                                    tuTo: '16:00',
                                },
                                {
                                    address: 'address2',
                                    // Monday
                                    moFrom: '11:00',
                                    moTo: '17:00',
                                    // Tuesday
                                    tuFrom: '11:00',
                                    tuTo: '17:00',
                                },
                            ],
                        },
                    },
                },
            },
        },
        include: {profile: true}
    })

    const provider = await prisma.user.upsert({
        where: { email: 'provider@test.com' },
        update: {},
        create: {
            email: 'provider@test.com',
            password: generatePassword('provider!'),
            activationLink: 'Provider',
            isActivated: true,
            name: 'Provider',
            tin: 'provider',
            role: UserRole.Provider,
            phone: '123123123',
            profile: {
                create: {
                    profileType: ProfileType.Provider,
                    // Provider
                    minOrderAmount: 10000,
                    deliveryMethods: [DeliveryMethods.deliveryBySupplier, DeliveryMethods.sameDayDelivery],
                    categories: [Categories.alcoholicDrinks, Categories.bakeryProducts, Categories.cannedFoods],
                },
            },
        },
        include: {profile: true}
    })

    const admin = await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
            email: 'admin@test.com',
            password: generatePassword('admin!'),
            activationLink: 'Admin',
            isActivated: true,
            name: 'Admin',
            tin: 'admin',
            role: UserRole.Admin,
            phone: '123123123'
        },
    })

    const product = await prisma.product.upsert({
        where: { id:  123 },
        update: {},
        create: {
            profile:{
                connect: {
                    id: provider.profile.id
                }
            },
            category : Categories.alcoholicDrinks,
            name: 'beer',
            description : 'beer',
            producer : 'OOO cool beer',
            cost: 5000,
            count: 200,
            packagingType: ProductPackagingType.Bottle,
        }
    })

    const futureDate = generateAcceptUntil()

    const horecaRequest = await prisma.horecaRequest.upsert({
        where: { id:  123},
        update: {},
        create: {
            profile:{
                connect: {
                    id: horeca.profile.id
                }
            },
            items :{
                createMany: {
                    data: [{
                        name : 'asdsa',
                        amount: 200,
                        unit: 'df',
                        category: Categories.alcoholicDrinks
                    }]
                }
            },
          
            address: 'address string',
            deliveryTime: futureDate,
            acceptUntill: futureDate,
            paymentType: PaymentType.Deferment,
            comment: '',
            name  : 'OOO smth',
            phone : '123123124'
        }
    })

    const providerRequest = await prisma.providerRequest.upsert({
        where: { id:  123},
        update: {},
        create: {
            profile:{
                connect: {
                    id: provider.profile.id
                }
            },
            horecaRequest: {
                connect: {
                    id: horecaRequest.id
                }
            },
            manufacturer: 'OOO sdadfsd',
            paymentType: PaymentType.Prepayment,
            cost: 10000
        }
    })
      
    console.log('Users:', { horeca, provider, admin })
    console.log('Products:', { product, horecaRequest, providerRequest })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async e => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
