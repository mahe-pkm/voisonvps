
import 'dotenv/config'
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import Decimal from "decimal.js"

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Mock logic from src/utils/tax.ts
function splitTaxByState(
    totalTax: Decimal,
    originState: string | undefined | null,
    buyerState: string | undefined | null
) {
    if (!originState || !buyerState) {
        return { mode: "UNKNOWN", cgst: new Decimal(0), sgst: new Decimal(0), igst: totalTax };
    }
    if (originState.trim().toLowerCase() === buyerState.trim().toLowerCase()) {
        const half = totalTax.div(2);
        return { mode: "CGST_SGST", cgst: half, sgst: half, igst: new Decimal(0) };
    }
    return { mode: "IGST", cgst: new Decimal(0), sgst: new Decimal(0), igst: totalTax };
}

async function main() {
    const envState = process.env.COMPANY_STATE || "Tamil Nadu" // Default from logic

    console.log("--- Configuration ---")
    console.log("Company State (Env/Default):", `'${envState}'`)

    console.log("\n--- Client Data ---")
    const clients = await prisma.client.findMany()

    for (const client of clients) {
        const tax = new Decimal(100)
        const result = splitTaxByState(tax, envState, client.state)

        console.log(`Client: ${client.name}`)
        console.log(`  State: '${client.state}'`)
        console.log(`  Mode: ${result.mode}`)

        if (result.mode === "IGST" && client.state?.toLowerCase().includes("tamil")) {
            console.warn("  [WARNING] Mismatch detected!")
            console.warn(`  Origin: '${envState}' vs Buyer: '${client.state}'`)
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
