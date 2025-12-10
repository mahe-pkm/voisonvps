
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { recordPayment } from "@/app/dashboard/invoices/actions"
import { Loader2 } from "lucide-react"
import { formatCurrency } from "@/utils/calculations"

interface PaymentDialogProps {
    invoice: {
        id: number
        invoiceNumber: string
        roundedTotal: string // Decimal serialized
        amountPaid?: string // if we had this on invoice, otherwise we rely on passed prop or fetch
        // For simplicity, we assume parent passes current pending or we don't valudate strictly client side
        status: string
    }
    children: React.ReactNode
}

export function PaymentDialog({ invoice, children }: PaymentDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // We don't have totalPaid on invoice object in DB (yet), so we just record new payment.
    // Dashboard logic handles the sum.

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const amount = formData.get("amount") as string
        const date = formData.get("date") as string
        const method = formData.get("method") as string

        const result = await recordPayment({
            invoiceId: invoice.id,
            amount: parseFloat(amount),
            date: new Date(date),
            method
        })

        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Payment recorded successfully")
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Payment for {invoice.invoiceNumber}</DialogTitle>
                </DialogHeader>
                <form action={onSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">Amount</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                required
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">Date</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                required
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="method" className="text-right">Method</Label>
                            <div className="col-span-3">
                                <Select name="method" defaultValue="Bank Transfer">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Cheque">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Record Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
