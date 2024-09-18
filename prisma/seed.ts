import { PrismaClient } from '@prisma/client'
import { parseArgs } from 'node:util'
import { runTestSeeds } from './seed.test'
import { runDevSeeds } from './seed.dev'
import * as dotenv from 'dotenv'

dotenv.config()

const options = {
    environment: { type: 'string' as 'string' },
}

const prisma = new PrismaClient()
async function main() {
    const {
        values: { environment },
    } = parseArgs({ options })

    switch (environment) {
        case 'test':
            await runTestSeeds(prisma)
            break
        default:
            await runDevSeeds(prisma)
            break
    }
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
