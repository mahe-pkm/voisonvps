import { prisma } from "@/lib/prisma"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { InvoiceActions } from "./InvoiceActions"
import { getCompanyProfile } from "@/lib/companyProfile"
import PageContainer from "@/components/PageContainer"
import { Badge } from "@/components/ui/badge"

export default async function InvoicesPage() {
    const companyProfile = await getCompanyProfile()

    // Force weak consistency check
    const invoices = await prisma.invoice.findMany({
        where: {},
        include: { client: true },
        orderBy: { createdAt: "desc" },
    })

    return (
        <PageContainer className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        All Invoices
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your billing history
                    </p>
                </div>
                <Link href="/dashboard/invoices/new">
                    <Button className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
                        <Plus className="mr-2 h-4 w-4" /> New Invoice
                    </Button>
                </Link>
            </div>

            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-xl overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 border-b border-white/10 hover:bg-muted/40">
                            <TableHead className="w-[120px]">Invoice #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-48 text-muted-foreground bg-white/30 dark:bg-black/20">
                                    No invoices found. Create your first one!
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((inv: any) => {
                                // Serialize Decimal objects (Prisma quirk for client components)
                                const invoice = {
                                    ...inv,
                                    subtotal: inv.subtotal.toString(),
                                    taxTotal: inv.taxTotal.toString(),
                                    totalAmount: inv.totalAmount.toString(),
                                    roundedTotal: inv.roundedTotal.toString(),
                                    client: {
                                        ...inv.client,
                                        openingBalance: inv.client.openingBalance ? inv.client.openingBalance.toString() : "0"
                                    }
                                }

                                return (
                                    <TableRow key={invoice.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors duration-200 cursor-default group border-b border-white/5">
                                        <TableCell className="font-mono font-medium text-blue-600 dark:text-blue-400">
                                            {invoice.invoiceNumber}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {format(invoice.issueDate, "dd MMM yyyy")}
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {invoice.client.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={invoice.status === "PAID" ? "default" : "secondary"}
                                                className={`
                                                    ${invoice.status === 'PAID'
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                                                    } transition-all duration-300 shadow-sm
                                                `}
                                            >
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {companyProfile.currency} {invoice.roundedTotal}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                                                <InvoiceActions
                                                    invoice={invoice}
                                                    appUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </PageContainer>
    )
}
