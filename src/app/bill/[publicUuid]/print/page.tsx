import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { TemplateResolver } from "@/components/invoice_templates/TemplateResolver"
import { getCompanyProfile } from "@/lib/companyProfile"
import { serializeInvoice } from "@/utils/serialization"
import { InvoiceData } from "@/types/invoice"

export default async function PrintAllPage({ params, searchParams }: { params: Promise<{ publicUuid: string }>, searchParams: Promise<{ mode?: string }> }) {
    const { publicUuid } = await params
    const { mode } = await searchParams

    const inv = await prisma.invoice.findUnique({
        where: { publicUuid },
        include: {
            client: true,
            lines: {
                include: { taxRate: true }
            },
            paymentTerms: true
        }
    })

    if (!inv) notFound()

    // Fully serialize
    const invoice = serializeInvoice(inv) as unknown as InvoiceData

    const companyProfile = await getCompanyProfile()

    // Filter copies based on mode
    let copies = ["Original", "Duplicate", "Triplicate"]
    if (mode) {
        if (mode.toUpperCase() === "ORIGINAL") copies = ["Original"]
        else if (mode.toUpperCase() === "DUPLICATE") copies = ["Duplicate"]
        else if (mode.toUpperCase() === "TRANSPORTER") copies = ["Transporter"]
        else if (mode.toUpperCase() === "TRIPLICATE") copies = ["Triplicate"]
    }

    return (
        <div className="bg-white">
            {copies.map((copy, index) => (
                <div key={copy}>
                    <div className="print-page">
                        <TemplateResolver
                            templateName={invoice.templateName}
                            invoice={invoice}
                            copyMode={copy}
                            companyProfile={companyProfile}
                        />
                    </div>
                    {index < copies.length - 1 && <div className="page-break" />}
                </div>
            ))}
        </div>
    )
}
