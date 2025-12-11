import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Checking Tax Rates...")
    const rates = await prisma.taxRate.findMany()
    console.log(`Found ${rates.length} tax rates.`)

    if (rates.length === 0) {
        console.log("⚠️ No Tax Rates found! Seeding now...")
        const taxRates = [5, 12, 18, 28]
        for (const rate of taxRates) {
            await prisma.taxRate.create({
                data: { name: `GST ${rate}%`, rate: rate }
            })
        }
        console.log("✅ Seeded Tax Rates (5%, 12%, 18%, 28%)")
    } else {
        console.table(rates)
        console.log("✅ Tax Rates exist.")
    }

    console.log("\n🔍 Checking Payment Terms...")
    const terms = await prisma.paymentTerm.findMany()
    if (terms.length === 0) {
        console.log("⚠️ No Payment Terms found! Seeding now...")
        await prisma.paymentTerm.create({ data: { name: 'Net 15', days: 15 } })
        await prisma.paymentTerm.create({ data: { name: 'Net 30', days: 30 } })
        console.log("✅ Seeded Payment Terms")
    } else {
        console.table(terms)
        console.log("✅ Payment Terms exist.")
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
