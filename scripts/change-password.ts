import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    const newPassword = process.argv[3]

    if (!email || !newPassword) {
        console.error('\nUsage: npx ts-node scripts/change-password.ts <email> <new_password>')
        console.error('Example: npx ts-node scripts/change-password.ts admin@example.com mySecretPass123\n')
        process.exit(1)
    }

    console.log(`Hashing password for ${email}...`)
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        })
        console.log(`\n✅ SUCCESS: Password updated for user: ${user.email}`)
        console.log(`👉 You can now login with your new password.\n`)
    } catch (error) {
        console.error('\n❌ Error updating password. Does the user exist?')
        console.error(error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
