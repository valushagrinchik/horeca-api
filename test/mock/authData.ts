import { ProfileType } from '@prisma/client'
import { Categories, DeliveryMethods, Weekday } from '../../src/system/utils/enums'

export const horecaUsers = [
    {
        email: 'horeca-test@test.com',
        password: 'horeca-test',
        repeatPassword: 'horeca-test',
        GDPRApproved: true,
        name: 'horeca-test',
        tin: 'horeca-test',
        phone: '12312312232',
        profile: {
            profileType: ProfileType.Horeca,
            info: 'info',
            addresses: [
                {
                    weekdays: [Weekday.mo, Weekday.tu],
                    address: 'address1',
                    // Monday
                    moFrom: '12:00',
                    moTo: '16:00',
                    // Tuesday
                    tuFrom: '12:00',
                    tuTo: '16:00',
                },
                {
                    weekdays: [Weekday.mo, Weekday.tu],
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
]

export const providerUsers = [
    {
        email: 'provider-test@test.com',
        password: 'provider-test',
        repeatPassword: 'provider-test',
        GDPRApproved: true,
        name: 'Provider',
        tin: 'provider',
        phone: '123123123',
        profile: {
            profileType: ProfileType.Provider,
            minOrderAmount: 10000,
            deliveryMethods: [DeliveryMethods.deliveryBySupplier, DeliveryMethods.sameDayDelivery],
            categories: [Categories.alcoholicDrinks, Categories.bakeryProducts, Categories.cannedFoods],
        },
    },
]
