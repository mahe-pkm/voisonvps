
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/utils/calculations"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ClientLedgerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    if (isNaN(id)) notFound()

    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            invoices: {
                where: { status: { not: "DRAFT" } },
                include: { payments: true }
            }
        }
    })

    if (!client) notFound()

    // Calculate Ledger
    // 1. Invoices (Debits)
    const invoices = client.invoices.map(inv => ({
        id: inv.id,
        date: inv.issueDate,
        type: "INVOICE",
        ref: inv.invoiceNumber,
        debit: Number(inv.roundedTotal),
        credit: 0
    }))

    // 2. Payments (Credits) - Fetch payments Linked to Invoices
    // Note: If we had "Client Payments" (on account) that weren't linked, we'd query Payment table directly with clientId (if schema supported it).
    // Currently Payments are linked to Invoice. So we flattening them.
    const payments = client.invoices.flatMap(inv =>
        inv.payments.map(p => ({
            id: p.id,
            date: p.date,
            type: "PAYMENT",
            ref: `PAY-${p.id} (Inv: ${inv.invoiceNumber})`,
            debit: 0,
            credit: Number(p.amount)
        }))
    )

    // 3. Opening Balance
    const transactions = [
        {
            id: 0,
            date: new Date(0), // Far past
            type: "OPENING_BALANCE",
            ref: "-",
            debit: Number(client.openingBalance) > 0 ? Number(client.openingBalance) : 0,
            credit: Number(client.openingBalance) < 0 ? Math.abs(Number(client.openingBalance)) : 0,
        },
        ...invoices,
        ...payments
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // 4. Calculate Running Balance
    let balance = 0
    const ledger = transactions.map(t => {
        balance += t.debit - t.credit
        return { ...t, balance }
    })

    // Remove the utility "Opening Balance" row date hack
    const finalLedger = ledger.map(l => ({
        ...l,
        dateStr: l.type === "OPENING_BALANCE" ? "-" : format(l.date, "dd-MMM-yyyy")
    }))

    const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.debit, 0)
    const totalPaid = payments.reduce((acc, curr) => acc + curr.credit, 0)
    const totalDue = balance // Final balance

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/clients">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
                    <p className="text-muted-foreground">{client.clientNumber} | {client.gstin || "No GSTIN"}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalDue > 0 ? "text-red-500" : "text-gray-900"}`}>
                            {formatCurrency(totalDue)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ledger</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description / Ref</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {finalLedger.map((row, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{row.dateStr}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{row.type}</span>
                                            <span className="text-xs text-muted-foreground">{row.ref}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-red-600 font-medium">
                                        {row.debit > 0 ? formatCurrency(row.debit) : "-"}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600 font-medium">
                                        {row.credit > 0 ? formatCurrency(row.credit) : "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {formatCurrency(row.balance)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
