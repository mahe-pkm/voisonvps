import { prisma } from "@/lib/prisma"
import { companyConfig } from "@/lib/companyConfig"
import { getCurrentProfileId } from "@/lib/currentProfile"

export interface CompanyProfileData {
    id?: string
    name: string
    address: string
    state: string
    gstin: string
    bankDetails: {
        name: string | null
        branch: string | null
        accountNo: string | null
        ifsc: string | null
    }
    sealUrl: string | null
    signatureUrl: string | null
    upiQrUrl: string | null
    logoUrl: string | null
    paymentTerms: string | null
    termsAndConditions: string | null
    currency: string
}

export async function getCompanyProfile(profileId?: string | null): Promise<CompanyProfileData> {

    let idToFetch = profileId

    // If no specific ID requested, try to infer from session/cookie
    if (!idToFetch) {
        idToFetch = await getCurrentProfileId()
    }

    let profile = null

    if (idToFetch) {
        profile = await prisma.companyProfile.findUnique({
            where: { id: idToFetch }
        })
    } else {
        // Fallback: If no user session or no profile linked, 
        // fetch the first one (Legacy/Admin support)
        profile = await prisma.companyProfile.findFirst()
    }

    if (profile) {
        return {
            id: profile.id,
            name: profile.name,
            address: profile.address,
            state: profile.state,
            gstin: profile.gstin,
            bankDetails: {
                name: profile.bankName,
                branch: profile.bankBranch,
                accountNo: profile.bankAccountNo,
                ifsc: profile.bankIfsc,
            },
            sealUrl: profile.sealUrl,
            signatureUrl: profile.signatureUrl,
            upiQrUrl: profile.upiQrUrl,
            logoUrl: profile.logoUrl,
            paymentTerms: profile.paymentTerms,
            termsAndConditions: profile.termsAndConditions,
            currency: profile.currency
        }
    }

    // Fallback to env config if DB is empty
    return {
        name: companyConfig.name,
        address: companyConfig.address,
        state: companyConfig.state,
        gstin: companyConfig.gstin,
        bankDetails: {
            name: companyConfig.bankDetails.name || null,
            branch: companyConfig.bankDetails.branch || null,
            accountNo: companyConfig.bankDetails.accountNo || null,
            ifsc: companyConfig.bankDetails.ifsc || null,
        },
        sealUrl: companyConfig.sealUrl || null,
        signatureUrl: companyConfig.signatureUrl || null,
        upiQrUrl: companyConfig.upiQrUrl || null,
        logoUrl: null,
        paymentTerms: companyConfig.paymentTerms,
        termsAndConditions: "Goods once sold will not be taken back.\nInterest @ 18% p.a. will be charged for delayed payment.\nSubject to Tamil Nadu Jurisdiction only.",
        currency: "₹"
    }
}
