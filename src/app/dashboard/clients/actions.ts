"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Decimal } from "decimal.js"

// Helper to check auth
async function checkAuth() {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error("Unauthorized")
}

export async function createClient(formData: FormData) {
    await checkAuth()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const gstin = formData.get("gstin") as string
    const billingAddr = formData.get("billingAddr") as string
    const shippingAddr = formData.get("shippingAddr") as string
    const state = formData.get("state") as string

    if (!name) return { error: "Name is required" }

    try {
        await prisma.client.create({
            data: {
                name,
                email: email || null,
                phone: phone || null,
                gstin: gstin || null,
                billingAddr: billingAddr || null,
                shippingAddr: shippingAddr || null,
                state: state || null,
                clientNumber: (formData.get("clientNumber") as string) || `CL-${Date.now()}`,
                openingBalance: new Decimal((formData.get("openingBalance") as string) || "0"),
            },
        })
        revalidatePath("/dashboard/clients")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to create client" }
    }
}

export async function updateClient(id: number, formData: FormData) {
    await checkAuth()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const gstin = formData.get("gstin") as string
    const billingAddr = formData.get("billingAddr") as string
    const shippingAddr = formData.get("shippingAddr") as string
    const state = formData.get("state") as string

    try {
        await prisma.client.update({
            where: { id },
            data: {
                name,
                email: email || null,
                phone: phone || null,
                gstin: gstin || null,
                billingAddr: billingAddr || null,
                shippingAddr: shippingAddr || null,
                state: state || null,
                clientNumber: (formData.get("clientNumber") as string) || undefined,
                openingBalance: formData.get("openingBalance") ? new Decimal(formData.get("openingBalance") as string) : undefined,
            },
        })
        revalidatePath("/dashboard/clients")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to update client" }
    }
}

export async function deleteClient(id: number) {
    await checkAuth()
    try {
        await prisma.client.delete({ where: { id } })
        revalidatePath("/dashboard/clients")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to delete client (might have invoices)" }
    }
}
