import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { TemplateResolver } from "@/components/invoice_templates/TemplateResolver"
import { PrintButton } from "@/components/PrintButton"
import { getCompanyProfile } from "@/lib/companyProfile"
import { serializeInvoice } from "@/utils/serialization"
import { InvoiceData } from "@/types/invoice"

interface PublicBillPageProps {
    params: {
        publicUuid: string
    }
    searchParams: {
        copy?: string // Original, Duplicate, Triplicate
    }
}

export async function generateMetadata({ params, searchParams }: any) {
    const { publicUuid } = await params;
    return {
        title: `Invoice View - ${publicUuid}`
    }
}

export default async function PublicBillPage({ params, searchParams }: any) {
    const { publicUuid } = await params
    const { copy } = await searchParams

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

    if (!inv) {
        notFound()
    }

    // Fully serialize the object to be safe for Client Components
    // Arrays, Decimals, Dates -> Strings/Numbers/Arrays
    const invoice = serializeInvoice(inv) as unknown as InvoiceData



    const companyProfile = await getCompanyProfile()

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <TemplateResolver
                templateName={invoice.templateName || "TemplateA"}
                invoice={invoice}
                copyMode={copy}
                companyProfile={companyProfile}
            />
            {/* Print floating button */}
            <div className="fixed bottom-8 right-8 print:hidden">
                <PrintButton />
            </div>
        </div>
    )
}
