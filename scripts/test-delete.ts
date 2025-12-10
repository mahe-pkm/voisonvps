
import { prisma } from "../src/lib/prisma"
import { deleteInvoice, createInvoice } from "../src/app/dashboard/invoices/actions"
import { randomUUID } from "crypto"

async function main() {
    console.log("Starting Delete Test...")

    // 1. Create a dummy invoice directly to avoid UI issues
    // We need a client.
    const client = await prisma.client.findFirst()
    if (!client) {
        console.error("No client found to create invoice for test")
        return
    }

    console.log("Creating Test Invoice...")
    // We'll use the raw prisma create to ensure we have an ID, or reuse createInvoice action if possible.
    // Let's use prisma.create to skip auth checks in the action for this setup part, 
    // but wait, deleteInvoice checks auth. I need to mock auth or use the action if I can't session.
    // 'deleteInvoice' uses 'getServerSession'. Running this script locally via 'tsx' won't have a session.
    // I should probably test the PRISMA delete logic directly first to rule out DB constraints.

    const inv = await prisma.invoice.create({
        data: {
            publicUuid: randomUUID(),
            invoiceNumber: "DEL-TEST-" + Date.now(),
            clientId: client.id,
            issueDate: new Date(),
            status: "DRAFT",
            templateName: "TemplateA",
            subtotal: "100",
            taxTotal: "0",
            totalAmount: "100",
            roundedTotal: "100",
            lines: {
                create: {
                    description: "Test Item",
                    quantity: "1",
                    unitPrice: "100",
                    unit: "Nos",
                    lineTotal: "100"
                }
            }
        }
    })

    console.log("Created Invoice ID:", inv.id)

    // 2. Try to delete it using Prisma directly first (simulating what the action does, sans Auth)
    console.log("Attempting Cascade Delete via Prisma...")
    try {
        await prisma.invoiceLine.deleteMany({ where: { invoiceId: inv.id } })
        await prisma.payment.deleteMany({ where: { invoiceId: inv.id } })

        const deleted = await prisma.invoice.delete({
            where: { id: inv.id }
        })
        console.log("Successfully deleted invoice:", deleted.id)
    } catch (e: any) {
        console.error("FAILED to delete:", e)
    }
}

main()
