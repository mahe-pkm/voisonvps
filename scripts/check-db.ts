
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    try {
        const inv = await prisma.invoice.findUnique({
            where: { invoiceNumber: "FIXED-TEST" },
            include: { companyProfile: true }
        })
        if (inv) {
            console.log("SUCCESS: Invoice Found!")
            console.log(JSON.stringify(inv, null, 2))
        } else {
            console.log("FAILURE: Invoice NOT Found")
        }
    } catch (e) {
        console.error(e)
    }
}

main()
