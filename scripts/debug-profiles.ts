
import { prisma } from "@/lib/prisma"

async function main() {
    const profiles = await prisma.companyProfile.findMany()
    console.log("Total Profiles:", profiles.length)
    profiles.forEach(p => {
        console.log(`ID: ${p.id}, Name: ${p.name}, Currency: ${p.currency}, Default: ${p.isDefault}`)
    })
}

main()
