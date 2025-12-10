
import { getCompanyProfile } from "@/lib/companyProfile"
import { CompanyProfileForm } from "@/components/CompanyProfileForm"

export default async function SettingsPage() {
    try {
        const profile = await getCompanyProfile()

        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your company details and invoicing preferences.</p>
                <CompanyProfileForm initialData={profile} />
            </div>
        )
    } catch (error: any) {
        console.error("Settings Page Error:", error)
        return (
            <div className="p-8 text-red-500">
                <h2 className="text-xl font-bold">Error Loading Settings</h2>
                <p>{error.message || "Unknown error occurred"}</p>
                <pre className="mt-4 bg-muted p-4 rounded text-xs text-black overflow-auto">
                    {JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}
                </pre>
            </div>
        )
    }
}
