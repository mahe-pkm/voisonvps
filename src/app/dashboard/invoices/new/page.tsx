import { prisma } from "@/lib/prisma"
import { InvoiceForm } from "@/components/InvoiceForm"
import { getCompanyProfile } from "@/lib/companyProfile"

export default async function NewInvoicePage() {
    const clients = await prisma.client.findMany({
        orderBy: { name: "asc" }
    })

    const taxRates = await prisma.taxRate.findMany({
        orderBy: { rate: "asc" }
    })

    const companyProfile = await getCompanyProfile()

    // Serialize decimals
    // Serialize safely
    const serializedRates = JSON.parse(JSON.stringify(taxRates))
    const serializedClients = JSON.parse(JSON.stringify(clients))
    const serializedProfile = JSON.parse(JSON.stringify(companyProfile))

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Create Invoice</h2>
            <InvoiceForm
                clients={serializedClients}
                taxRates={serializedRates}
                companyProfile={serializedProfile}
            />
        </div>
    )
}
