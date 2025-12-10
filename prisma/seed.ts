import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as bcrypt from 'bcrypt'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme'

    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // Seed Tax Rates
    const taxRates = [5, 12, 18, 28]
    for (const rate of taxRates) {
        const exists = await prisma.taxRate.findFirst({ where: { rate: rate } });
        if (!exists) {
            await prisma.taxRate.create({
                data: { name: `GST ${rate}%`, rate: rate }
            })
        }
    }

    // Seed Payment Terms
    const terms = [
        { name: 'Net 15', days: 15 },
        { name: 'Net 30', days: 30 },
    ]
    for (const term of terms) {
        const exists = await prisma.paymentTerm.findFirst({ where: { name: term.name } })
        if (!exists) {
            await prisma.paymentTerm.create({ data: term })
        }
    }

    // Seed Admin User
    const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
