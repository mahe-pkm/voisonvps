import { TemplateA } from "@/components/invoice_templates/TemplateA/TemplateA"
import { TemplateB } from "@/components/invoice_templates/TemplateB/TemplateB"
import { TemplateC } from "@/components/invoice_templates/TemplateC/TemplateC"
import { TransportSlip } from "@/components/invoice_templates/TransportSlip/TransportSlip"

import { CompanyProfileData } from "@/lib/companyProfile"
import { InvoiceData } from "@/types/invoice"

interface TemplateResolverProps {
    templateName: string
    invoice: InvoiceData
    copyMode?: string
    companyProfile: CompanyProfileData
}

export function TemplateResolver({ templateName, invoice, copyMode, companyProfile }: TemplateResolverProps) {
    // If templateName is explicitly "TransportSlip", we render that.
    if (templateName === "TransportSlip") {
        return <TransportSlip invoice={invoice} companyProfile={companyProfile} />
    }

    switch (templateName) {
        case "TemplateB":
            return <TemplateB invoice={invoice} copyMode={copyMode} companyProfile={companyProfile} />
        case "TemplateC":
            return <TemplateC invoice={invoice} copyMode={copyMode} companyProfile={companyProfile} />
        case "TemplateA":
        default:
            return <TemplateA invoice={invoice} copyMode={copyMode} companyProfile={companyProfile} />
    }
}
