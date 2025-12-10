import { prisma } from "@/lib/prisma"
import Decimal from "decimal.js"
import PageContainer from "@/components/PageContainer"
import { DashboardStats } from "@/components/DashboardStats"
import { getCompanyProfile } from "@/lib/companyProfile"

export default async function DashboardPage() {
    // Fetch summary stats
    const invoiceCount = await prisma.invoice.count()
    const clientCount = await prisma.client.count()
    const companyProfile = await getCompanyProfile()
    console.log("Dashboard fetch currency:", companyProfile?.currency)

    // Total Receivable (All non-draft invoices)
    const totalReceivable = await prisma.invoice.aggregate({
        _sum: { roundedTotal: true },
        where: { status: { not: "DRAFT" } }
    })

    // Total Received (All payments)
    const totalReceived = await prisma.payment.aggregate({
        _sum: { amount: true }
    })

    const receivableAmount = new Decimal(totalReceivable._sum.roundedTotal || 0)
    const receivedAmount = new Decimal(totalReceived._sum.amount || 0)
    const pendingAmount = receivableAmount.sub(receivedAmount)

    return (
        <PageContainer className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Dashboard Overview
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Here's what's happening with your business today.
                    </p>
                </div>
            </div>

            <DashboardStats
                receivedAmount={receivedAmount.toString()}
                pendingAmount={pendingAmount.toString()}
                invoiceCount={invoiceCount}
                clientCount={clientCount}
                currency={companyProfile.currency}
            />

            {/* Placeholder for future charts */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 bg-white/50 dark:bg-black/20 backdrop-blur-md border rounded-xl p-6 h-[300px] flex items-center justify-center text-muted-foreground border-dashed">
                    Revenue Chart (Coming Soon)
                </div>
                <div className="col-span-3 bg-white/50 dark:bg-black/20 backdrop-blur-md border rounded-xl p-6 h-[300px] flex items-center justify-center text-muted-foreground border-dashed">
                    Recent Activity (Coming Soon)
                </div>
            </div>
        </PageContainer>
    )
}
