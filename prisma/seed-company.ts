import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Inline config to avoid import issues
const CONFIG = {
    name: process.env.COMPANY_NAME || "Demo Company",
    address: process.env.COMPANY_ADDRESS || "No. 1, Demo Street",
    state: process.env.COMPANY_STATE || "Tamil Nadu",
    gstin: process.env.COMPANY_GSTIN || "29ABCDE1234F1Z5",
    bankName: process.env.COMPANY_BANK_NAME,
    bankBranch: process.env.COMPANY_BANK_BRANCH,
    bankAccountNo: process.env.COMPANY_BANK_ACCOUNT_NO,
    bankIfsc: process.env.COMPANY_BANK_IFSC,
    sealUrl: process.env.COMPANY_SEAL_IMAGE_URL,
    signatureUrl: process.env.COMPANY_SIGNATURE_IMAGE_URL,
    upiQrUrl: process.env.UPI_QR_IMAGE_URL,
    paymentTerms: "15 Days"
}

async function main() {
    const existing = await prisma.companyProfile.findFirst()
    if (existing) {
        console.log("Company profile already exists. Skipping.")
        return
    }

    await prisma.companyProfile.create({
        data: {
            name: CONFIG.name,
            address: CONFIG.address,
            state: CONFIG.state,
            gstin: CONFIG.gstin,
            bankName: CONFIG.bankName,
            bankBranch: CONFIG.bankBranch,
            bankAccountNo: CONFIG.bankAccountNo,
            bankIfsc: CONFIG.bankIfsc,
            sealUrl: CONFIG.sealUrl,
            signatureUrl: CONFIG.signatureUrl,
            upiQrUrl: CONFIG.upiQrUrl,
            paymentTerms: CONFIG.paymentTerms
        }
    })
    console.log("Seeded Company Profile from .env")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
