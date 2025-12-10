"use server"

import { prisma } from "@/lib/prisma"
import { CompanyProfileData } from "@/lib/companyProfile"
import { revalidatePath } from "next/cache"

import { getCurrentProfileId } from "@/lib/currentProfile"

export async function updateCompanyProfile(data: CompanyProfileData) {
    const payload = {
        name: data.name,
        address: data.address,
        state: data.state,
        gstin: data.gstin,
        bankName: data.bankDetails.name,
        bankBranch: data.bankDetails.branch,
        bankAccountNo: data.bankDetails.accountNo,
        bankIfsc: data.bankDetails.ifsc,
        sealUrl: data.sealUrl,
        signatureUrl: data.signatureUrl,
        upiQrUrl: data.upiQrUrl,
        logoUrl: data.logoUrl,
        paymentTerms: data.paymentTerms,
        termsAndConditions: data.termsAndConditions,
        currency: data.currency
    }

    let idToUpdate = await getCurrentProfileId()

    // Find the profile to update
    const existing = idToUpdate
        ? await prisma.companyProfile.findUnique({ where: { id: idToUpdate } })
        : await prisma.companyProfile.findFirst()

    if (!existing && !idToUpdate) {
        // Create new if absolutely nothing exists
        await prisma.companyProfile.create({
            data: {
                ...payload,
                // userId? logic needed here if we had user context in action
            }
        })
        revalidatePath("/dashboard", "layout")
        return
    }

    // Update existing
    // We recreate payload here to be safe and clear (or use the one below)
    if (existing) {
        await prisma.companyProfile.update({
            where: { id: existing.id },
            data: payload
        })
    }

    revalidatePath("/dashboard/settings")
    revalidatePath("/dashboard", "layout")
    revalidatePath("/bill")
}
