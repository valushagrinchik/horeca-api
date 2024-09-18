import { PrismaClient } from '@prisma/client'
import {
    horecaUserInput,
    providerUserInput,
    adminUserInput,
} from '../test/mock/seedData'

import * as dotenv from 'dotenv'
import { generatePassword } from '../src/system/crypto'
dotenv.config()

export const runTestSeeds = async (prisma: PrismaClient) => {
    const horeca = await prisma.user.create({
        data: {
            ...horecaUserInput,
            password: generatePassword(horecaUserInput.password),
            isActivated: true,
            profile: {
                create: {
                    ...horecaUserInput.profile,
                    addresses: { createMany: { data: horecaUserInput.profile.addresses } },
                },
            },
        },
        include: { profile: true },
    })

    const provider = await prisma.user.create({
        data: {
            ...providerUserInput,
            password: generatePassword(providerUserInput.password),
            isActivated: true,
            profile: {
                create: {
                    ...providerUserInput.profile,
                },
            },
        },
        include: { profile: true },
    })

    const admin = await prisma.user.create({
        data: { ...adminUserInput, password: generatePassword(adminUserInput.password), isActivated: true },
    })

    console.log('Users:', { horeca, provider, admin })
}
