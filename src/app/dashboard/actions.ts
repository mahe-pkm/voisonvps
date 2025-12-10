"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function switchProfile(profileId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const userId = parseInt(session.user.id)

    // Verify ownership
    const profile = await prisma.companyProfile.findFirst({
        where: { id: profileId, userId }
    })

    if (!profile) throw new Error("Profile not found or access denied")

    const cookieStore = await cookies()
    cookieStore.set("selected-profile-id", profileId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax"
    })

    revalidatePath("/")
    return { success: true }
}

export async function createProfile(data: { name: string, state: string, address: string, gstin: string }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const userId = parseInt(session.user.id)

    // Create new profile
    const profile = await prisma.companyProfile.create({
        data: {
            ...data,
            userId,
            // Defaults
            isDefault: false
        }
    })

    return { success: true, id: profile.id }
}
