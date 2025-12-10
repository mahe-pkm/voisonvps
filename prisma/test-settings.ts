
import { getCompanyProfile } from "@/lib/companyProfile"
import { prisma } from "@/lib/prisma"

// Mock request-scoped context if needed, but getCompanyProfile seems standalone.
// However, it imports from @/lib/prisma which expects environment.

async function main() {
    console.log("Testing getCompanyProfile...")
    try {
        const profile = await getCompanyProfile()
        console.log("Success! Profile:", JSON.stringify(profile, null, 2))
    } catch (e: any) {
        console.error("Error fetching profile:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
