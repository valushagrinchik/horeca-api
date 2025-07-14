import { PrismaClient } from '@prisma/client'
import { runTestSeeds } from './seed.test'
import { runDevSeeds } from './seed.dev'

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
import * as dotenv from 'dotenv'
dotenv.config({ path: envFile });

const prisma = new PrismaClient()
async function main() {
    switch (process.env.NODE_ENV) {
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
