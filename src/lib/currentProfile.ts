
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

/**
 * Retrieves the currently selected profile ID for the logged-in user.
 * Priority:
 * 1. Cookie 'selected-profile-id'
 * 2. User's default profile (isDefault: true)
 * 3. Any profile belonging to user
 */
export async function getCurrentProfileId(): Promise<string | null> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return null

    const userId = parseInt(session.user.id)
    const cookieStore = await cookies()
    const selectedId = cookieStore.get("selected-profile-id")?.value

    // If cookie exists, verify ownership
    if (selectedId) {
        const profile = await prisma.companyProfile.findFirst({
            where: { id: selectedId, userId }
        })
        if (profile) return profile.id
    }

    // Fallback: Default profile
    const defaultProfile = await prisma.companyProfile.findFirst({
        where: { userId, isDefault: true }
    })

    if (defaultProfile) return defaultProfile.id

    // Fallback: Any profile
    const anyProfile = await prisma.companyProfile.findFirst({
        where: { userId }
    })

    return anyProfile ? anyProfile.id : null
}
