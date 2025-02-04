import { UserRole, ProfileType, PaymentType } from '@prisma/client'
import { generatePassword } from './../../src/system/crypto'
import { generateFutureDate } from './../../src/system/utils/date'
import { DeliveryMethods, Categories, Weekday } from './../../src/system/utils/enums'

export const providerUserInput = {
    email: 'provider-test2@test.com',
    password: 'provider-test',
    name: 'Provider',
    tin: 'provider2',
    phone: '123122223',
    role: UserRole.Provider,
    profile: {
        profileType: ProfileType.Provider,
        minOrderAmount: 10000,
        deliveryMethods: [DeliveryMethods.deliveryBySupplier, DeliveryMethods.sameDayDelivery],
        categories: [Categories.alcoholicDrinks, Categories.bakeryProducts, Categories.cannedFoods],
    },
}

export const productInput = {
    category: Categories.alcoholicDrinks,
    name: 'beer',
    description: 'beer',
    producer: 'OOO cool beer',
    cost: 5000,
    count: 200,
    packagingType: 'Bottle',
}

export const horecaUserInput = {
    email: 'horeca-test2@test.com',
    password: 'horeca-test',
    name: 'horeca-test2',
    tin: 'horeca-test2',
    phone: '12312312234',
    role: UserRole.Horeca,
    profile: {
        profileType: ProfileType.Horeca,
        info: 'info2',
        addresses: [
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
}

export const acceptUntill = generateFutureDate()
export const deliveryTime = generateFutureDate(14)

export const horecaRequestInput = {
    items: [
        {
            name: 'B',
            amount: 200,
            unit: 'df',
            category: Categories.alcoholicDrinks,
        },
        {
            name: 'D',
            amount: 2000,
            unit: 'df',
            category: Categories.dishes,
        },
        {
            name: 'C',
            amount: 208,
            unit: 'df',
            category: Categories.cannedFoods,
        },
    ],

    address: 'address string',
    deliveryTime,
    acceptUntill,
    paymentType: PaymentType.Deferment,
    comment: '',
    name: 'OOO smth',
    phone: '123123124',
}

// export const providerRequestsInput = [
//     {
//         comment: '',
//         items: [{
//             manufacturer: 'OOO sdadfsd',
//             available: true,
//             cost: 10000,
//         }]
//     },
// ]

export const adminUserInput = {
    email: 'admin@test.com',
    password: generatePassword('admin!'),
    activationLink: 'Admin',
    isActivated: true,
    name: 'Admin',
    tin: 'admin',
    role: UserRole.Admin,
    phone: '123123123',
}
