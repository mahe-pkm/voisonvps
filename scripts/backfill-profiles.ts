require('dotenv').config()
import { prisma } from '../src/lib/prisma'

// const prisma = new PrismaClient() removed

async function main() {
    console.log('Starting data backfill for multi-profile...')

    // 1. Get the first Admin user
    const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        orderBy: { id: 'asc' }
    })

    if (!adminUser) {
        console.warn('No ADMIN user found. Skipping backfill. Please ensure an admin user exists.')
        return
    }

    console.log(`Found Admin User: ${adminUser.email} (ID: ${adminUser.id})`)

    // 2. Get the existing Company Profile (there should only be one mainly)
    // If multiple, we take the one that looks most "default" or just the first one.
    const profiles = await prisma.companyProfile.findMany()

    if (profiles.length === 0) {
        console.log('No Company Profiles found to link.')
        return
    }

    // Assuming the first profile is the main one used so far
    const mainProfile = profiles[0]
    console.log(`Linking Profile "${mainProfile.name}" to Admin User...`)

    // 3. Link Profile to User and set as Default
    // @ts-ignore
    await prisma.companyProfile.update({
        where: { id: mainProfile.id },
        data: {
            userId: adminUser.id,
            isDefault: true
        }
    })

    console.log('Profile linked successfully.')

    // 4. Link all existing Invoices to this Profile
    console.log('Linking existing invoices to this profile...')
    // @ts-ignore
    const updateResult = await prisma.invoice.updateMany({
        where: { companyProfileId: null },
        data: {
            companyProfileId: mainProfile.id
        }
    })

    console.log(`Updated ${updateResult.count} invoices.`)
    console.log('Backfill complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
