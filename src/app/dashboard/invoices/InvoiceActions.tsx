"use client"

import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash, CreditCard, Eye, FileText, Share2, Pencil } from "lucide-react"
import { deleteInvoice } from "@/app/dashboard/invoices/actions"
import { toast } from "sonner"
import { PaymentDialog } from "@/components/PaymentDialog"
import { ShareButton } from "@/components/ShareButton"
import Link from "next/link"

interface InvoiceActionsProps {
    invoice: any
    appUrl: string
}

export function InvoiceActions({ invoice, appUrl }: InvoiceActionsProps) {
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        console.log("Delete button clicked for invoice:", invoice.id)
        if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
            console.log("Delete cancelled by user")
            return
        }

        console.log("Delete confirmed. Sending request...")
        setLoading(true)
        const res = await deleteInvoice(invoice.id)
        setLoading(false)
        console.log("Delete response:", res)

        if (res?.error) {
            console.error("Delete failed:", res.error)
            toast.error(res.error)
        } else {
            console.log("Delete success toast")
            toast.success("Invoice deleted")
        }
    }

    return (
        <div className="flex items-center justify-end gap-2">
            <ShareButton url={`${appUrl}/bill/${invoice.publicUuid}`} />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/bill/${invoice.publicUuid}`} target="_blank" className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Public
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <Link href={`/api/pdf/${invoice.publicUuid}?mode=ORIGINAL`} target="_blank" className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" /> Download Original
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/api/pdf/${invoice.publicUuid}?mode=DUPLICATE`} target="_blank" className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" /> Download Duplicate
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/api/pdf/${invoice.publicUuid}?mode=TRANSPORTER`} target="_blank" className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" /> Download Transporter
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/api/pdf/${invoice.publicUuid}`} target="_blank" className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" /> Download All Copies
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <PaymentDialog invoice={invoice}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                            <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                        </DropdownMenuItem>
                    </PaymentDialog>


                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
