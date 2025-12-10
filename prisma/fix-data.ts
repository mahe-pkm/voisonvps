
import 'dotenv/config'
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    // Fix Tech Corp
    const update = await prisma.client.updateMany({
        where: {
            name: "Tech Corp",
            OR: [{ state: { contains: "Tamil NaduTamil" } }, { state: "Tamil Nadu" }] // Or just update it anyway
        },
        data: { state: "Tamil Nadu" }
    })
    console.log("Updated clients:", update.count)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
