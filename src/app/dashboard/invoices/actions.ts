"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { calculateInvoiceTotals } from "@/utils/calculations"
import Decimal from "decimal.js"
import { getCurrentProfileId } from "@/lib/currentProfile"
import { randomUUID } from "crypto"

async function checkAuth() {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error("Unauthorized")
}

// ... (existing types)
export interface InvoiceFormData {
    clientId: number
    invoiceNumber: string
    issueDate: Date
    dueDate?: Date
    templateName: string
    lines: {
        description: string
        quantity: number | string // Allow string input from form
        unitPrice: number | string // Allow string input from form
        taxRateId?: number
        unit: string
        hsnSac?: string
    }[]
}

export async function createInvoice(data: InvoiceFormData) {
    console.log("Starting createInvoice", JSON.stringify(data, null, 2))
    try {
        await checkAuth()
        const currentProfileId = await getCurrentProfileId()
        console.log("Current Profile ID:", currentProfileId)

        // Ensure we have a profile ID
        let finalProfileId = currentProfileId
        if (!finalProfileId) {
            console.log("No current profile, falling back to user profiles")
            // Fallback: Fetch user's first profile directly
            const session = await getServerSession(authOptions)
            const email = session?.user?.email
            if (email) {
                const user = await prisma.user.findUnique({
                    where: { email },
                    include: { profiles: true }
                })
                finalProfileId = user?.profiles[0]?.id || null
                console.log("User Profile ID found:", finalProfileId)
            } else {
                console.log("No session email found for fallback")
            }

            // Ultimate Fallback: Just get the first profile in the DB (Legacy support)
            if (!finalProfileId) {
                console.log("Still no profile, falling back to ANY profile")
                const firstProfile = await prisma.companyProfile.findFirst()
                finalProfileId = firstProfile?.id || null
                console.log("Any Profile ID found:", finalProfileId)
            }
        }

        if (!finalProfileId) {
            console.log("No profile found - Creating invoice without profile (Legacy Mode)")
        }

        // Calculate totals server-side
        // Fetch Tax rates to get percent
        const taxRates = await prisma.taxRate.findMany()
        const taxMap = new Map(taxRates.map((t: any) => [t.id, t.rate.toNumber()]))

        const linesWithRate = data.lines.map(l => ({
            ...l,
            taxRatePercent: (l.taxRateId ? taxMap.get(l.taxRateId) : 0) || 0
        }))

        const totals = calculateInvoiceTotals(linesWithRate as any)
        console.log("Calculated Totals:", totals)

        try {
            console.log("Attempting database creation...")
            const invoice = await prisma.invoice.create({
                data: {
                    publicUuid: randomUUID(),
                    invoiceNumber: data.invoiceNumber,
                    clientId: data.clientId,
                    companyProfileId: finalProfileId,
                    issueDate: data.issueDate,
                    dueDate: data.dueDate,
                    status: "DRAFT",
                    templateName: data.templateName,
                    subtotal: totals.subtotal,
                    taxTotal: totals.taxTotal,
                    totalAmount: totals.totalAmount,
                    roundedTotal: totals.roundedTotal,

                    lines: {
                        create: linesWithRate.map(l => {
                            const qty = new Decimal(l.quantity)
                            const price = new Decimal(l.unitPrice)
                            const lineTotal = qty.mul(price)
                            return {
                                description: l.description,
                                quantity: qty,
                                unitPrice: price,
                                taxRateId: l.taxRateId,
                                unit: l.unit,
                                hsnSac: l.hsnSac,
                                lineTotal: lineTotal
                            }
                        })
                    }
                }
            })
            console.log("Invoice created successfully:", invoice.id)

            // Invalidate
            revalidatePath("/dashboard")
            revalidatePath("/dashboard/invoices")
            return { success: true, id: invoice.id }
        } catch (e: any) {
            console.error("Database Error:", e)
            return { error: e.message || "Failed to create invoice" }
        }
    } catch (e: any) {
        console.error("Critical Error in createInvoice:", e)
        return { error: e.message || "Critical failed to create invoice" }
    }
}

export async function recordPayment(data: { invoiceId: number, amount: number, date: Date, method: string }) {
    await checkAuth()

    try {
        const { invoiceId, amount, date, method } = data

        // 1. Create Payment
        await prisma.payment.create({
            data: {
                invoiceId,
                amount: new Decimal(amount),
                date,
                method
            }
        })

        // 2. Recalculate Totals
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { payments: true }
        })

        if (!invoice) throw new Error("Invoice not found")

        const totalPaid = invoice.payments.reduce((sum: Decimal, p: any) => sum.add(p.amount), new Decimal(0))
        const totalAmount = invoice.roundedTotal

        // 3. Update Status
        let newStatus = invoice.status
        if (totalPaid.gte(totalAmount)) {
            newStatus = "PAID"
        } else if (totalPaid.gt(0)) {
            newStatus = "PARTIALLY_PAID"
        } else {
            // If for some reason paid is 0 (refund?), revert to SENT if it wasn't DRAFT
            if (invoice.status !== "DRAFT") newStatus = "SENT"
        }

        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: newStatus }
        })

        revalidatePath("/dashboard")
        revalidatePath("/dashboard/invoices")
        return { success: true }
    } catch (e: any) {
        console.error(e)
        return { error: e.message || "Failed to record payment" }
    }
}

export async function deleteInvoice(id: number) {
    console.log("Attempting to delete invoice:", id)
    await checkAuth()
    try {
        // Cascade delete lines and payments
        console.log("Deleting invoice lines...")
        await prisma.invoiceLine.deleteMany({ where: { invoiceId: id } })
        console.log("Deleting invoice payments...")
        await prisma.payment.deleteMany({ where: { invoiceId: id } })

        console.log("Deleting invoice record...")
        await prisma.invoice.delete({
            where: { id }
        })

        console.log("Invoice deletion successful")
        revalidatePath("/dashboard")
        revalidatePath("/dashboard/invoices")
        return { success: true }
    } catch (e: any) {
        console.error("Delete Invoice Error:", e)
        return { error: e.message || "Failed to delete invoice" }
    }
}


