"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createInvoice } from "@/app/dashboard/invoices/actions"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { calculateInvoiceTotals, formatCurrency } from "@/utils/calculations"
import Decimal from "decimal.js"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { TemplateResolver } from "./invoice_templates/TemplateResolver"
import { serializeInvoice } from "@/utils/serialization"
import { CompanyProfileData } from "@/lib/companyProfile"
import { Eye } from "lucide-react"

// Types
// Types
type Client = {
    id: number
    name: string
    billingAddr: string | null
    shippingAddr: string | null
    state: string | null
    gstin: string | null
    email: string | null
    clientNumber: string | null
}

interface InvoiceFormProps {
    clients: Client[]
    taxRates: any[] // passed as serializable
    companyProfile: CompanyProfileData
}

export function InvoiceForm({ clients, taxRates, companyProfile }: InvoiceFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    // Convert taxRates back to Decimal
    const rates = taxRates.map(t => ({ ...t, rate: new Decimal(t.rate) }))

    const [date, setDate] = useState<Date | undefined>(new Date())
    const [clientId, setClientId] = useState<string>("")
    const [template, setTemplate] = useState("TemplateA")
    const [invoiceNumber, setInvoiceNumber] = useState("")

    const [lines, setLines] = useState([
        { description: "", quantity: 1, unitPrice: 0, taxRateId: "", unit: "Nos", hsnSac: "" }
    ])

    // Real-time calculation
    const calculated = calculateInvoiceTotals(lines.map((l: any) => {
        const rate = rates.find(r => r.id.toString() === l.taxRateId)?.rate.toNumber() || 0
        return {
            quantity: typeof l.quantity === 'string' ? parseFloat(l.quantity) : l.quantity,
            unitPrice: typeof l.unitPrice === 'string' ? parseFloat(l.unitPrice) : l.unitPrice,
            taxRatePercent: rate
        }
    }))

    function addLine() {
        setLines([...lines, { description: "", quantity: 1, unitPrice: 0, taxRateId: "", unit: "Nos", hsnSac: "" }])
    }

    function removeLine(index: number) {
        const newLines = [...lines]
        newLines.splice(index, 1)
        setLines(newLines)
    }

    function updateLine(index: number, field: string, value: any) {
        const newLines = [...lines]
        newLines[index] = { ...newLines[index], [field]: value }
        setLines(newLines)
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        console.log("Submit clicked. State:", { clientId, invoiceNumber, date, lines })

        if (!clientId || !invoiceNumber || !date) {
            console.warn("Validation failed. Missing:", {
                clientId: !clientId,
                invoiceNumber: !invoiceNumber,
                date: !date
            })
            toast.error("Please fill required fields")
            return
        }

        setIsLoading(true)

        const payload = {
            clientId: parseInt(clientId),
            invoiceNumber,
            issueDate: date,
            templateName: template,
            lines: lines.map((l: any) => ({
                description: l.description,
                quantity: typeof l.quantity === 'string' ? parseFloat(l.quantity) : l.quantity,
                unitPrice: typeof l.unitPrice === 'string' ? parseFloat(l.unitPrice) : l.unitPrice,
                taxRateId: l.taxRateId ? parseInt(l.taxRateId) : undefined,
                unit: l.unit,
                hsnSac: l.hsnSac
            }))
        }
        console.log("Payload prepared:", payload)

        try {
            console.log("Calling createInvoice...")
            const res = await createInvoice(payload)

            console.log("Server Response:", res)

            setIsLoading(false)
            if (res.error) {
                console.error("Server returned error:", res.error)
                toast.error(res.error)
            } else {
                console.log("Success! Redirecting...")
                toast.success("Invoice created!")
                router.push("/dashboard/invoices")
            }
        } catch (error) {
            console.error("Client-side submission error:", error)
            setIsLoading(false)
            toast.error("An unexpected error occurred")
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <form onSubmit={onSubmit} className="space-y-8">
                <div className="bg-muted/50 border rounded-md p-3 mb-6 flex items-center justify-between">
                    <div className="text-sm">
                        <span className="text-muted-foreground mr-2">Billing Entity:</span>
                        <span className="font-semibold">{companyProfile.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        GSTIN: {companyProfile.gstin}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        {/* Client Selection */}
                        <div className="space-y-2">
                            <Label>Client</Label>
                            <Select onValueChange={setClientId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date */}
                        <div className="space-y-2 flex flex-col">
                            <Label>Issue Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !date && "text-muted-foreground")}>
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Invoice Number */}
                        <div className="space-y-2">
                            <Label>Invoice Number</Label>
                            <Input
                                value={invoiceNumber}
                                onChange={e => setInvoiceNumber(e.target.value)}
                                placeholder="INV-001"
                                required
                            />
                        </div>

                        {/* Template */}
                        <div className="space-y-2">
                            <Label>Template</Label>
                            <div className="flex gap-2">
                                <Select value={template} onValueChange={setTemplate}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TemplateA">Template A (Standard)</SelectItem>
                                        <SelectItem value="TemplateB">Template B (Decor)</SelectItem>
                                        <SelectItem value="TemplateC">Template C (Bureau)</SelectItem>
                                        <SelectItem value="TransportSlip">Transport Slip</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon" title="Preview Template">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
                                        <DialogTitle>Template Preview</DialogTitle>
                                        <div className="border p-4 shadow-sm min-h-[500px]">
                                            {(() => {
                                                const selectedClient = clients.find(c => c.id.toString() === clientId) || {
                                                    id: 0,
                                                    name: "[Client Name]",
                                                    billingAddr: "[Billing Address]",
                                                    shippingAddr: null,
                                                    state: "[State]",
                                                    gstin: "GSTIN",
                                                    email: null,
                                                    clientNumber: null,
                                                }

                                                // Construct preview object
                                                const previewInvoice = {
                                                    templateName: template,
                                                    invoiceNumber: invoiceNumber || "INV-PREVIEW",
                                                    issueDate: date || new Date(),
                                                    client: selectedClient,
                                                    subtotal: calculated.subtotal.toFixed(2),
                                                    taxTotal: calculated.taxTotal.toFixed(2),
                                                    roundedTotal: calculated.roundedTotal.toFixed(2),
                                                    totalAmount: calculated.totalAmount.toFixed(2),
                                                    lines: lines.map((line: any) => ({
                                                        ...line,
                                                        quantity: typeof line.quantity === 'string' ? parseFloat(line.quantity) : line.quantity,
                                                        unitPrice: typeof line.unitPrice === 'string' ? parseFloat(line.unitPrice) : line.unitPrice,
                                                        lineTotal: new Decimal(line.quantity).mul(line.unitPrice).toString(), // Approximate
                                                        taxRate: rates.find(r => r.id.toString() === line.taxRateId) || { rate: new Decimal(0) }
                                                    }))
                                                }

                                                // Serialize for the template (which expects serialized data mostly)
                                                const serialized = serializeInvoice(previewInvoice)

                                                return (
                                                    <div className="scale-90 origin-top">
                                                        <TemplateResolver
                                                            templateName={template}
                                                            invoice={serialized}
                                                            companyProfile={companyProfile}
                                                            copyMode="Preview"
                                                        />
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="border rounded-lg p-4 bg-card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Items</h3>
                        <Button type="button" variant="ghost" size="sm" onClick={addLine}>
                            <Plus className="h-4 w-4 mr-1" /> Add Item
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="hidden md:grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground mb-2 px-2">
                            <div className="col-span-4">Description</div>
                            <div className="col-span-2">HSN/SAC</div>
                            <div className="col-span-1">Qty</div>
                            <div className="col-span-2">Rate</div>
                            <div className="col-span-2">Tax</div>
                            <div className="col-span-1 text-right">Total</div>
                        </div>

                        {lines.map((line: any, i: number) => (
                            <div key={i} className="group relative bg-card md:bg-transparent border md:border-0 md:border-b last:border-0 rounded-lg md:rounded-none p-4 md:p-1 shadow-sm md:shadow-none mb-4 md:mb-0">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-2 items-start md:items-center">
                                    {/* Mobile: Header Row */}
                                    <div className="md:col-span-4 w-full">
                                        <Label className="md:hidden text-xs text-muted-foreground mb-1 block">Description</Label>
                                        <Input
                                            placeholder="Description"
                                            value={line.description}
                                            onChange={e => updateLine(i, 'description', e.target.value)}
                                        />
                                    </div>

                                    {/* Mobile: 2-col grid for details */}
                                    <div className="grid grid-cols-2 gap-2 md:contents">
                                        <div className="md:col-span-2">
                                            <Label className="md:hidden text-xs text-muted-foreground mb-1 block">HSN</Label>
                                            <Input
                                                placeholder="HSN"
                                                value={line.hsnSac || ""}
                                                onChange={e => updateLine(i, 'hsnSac', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <Label className="md:hidden text-xs text-muted-foreground mb-1 block">Qty</Label>
                                            <Input
                                                type="number"
                                                value={line.quantity}
                                                onChange={e => updateLine(i, 'quantity', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Mobile: 2-col grid for Pricing */}
                                    <div className="grid grid-cols-2 gap-2 md:contents">
                                        <div className="md:col-span-2">
                                            <Label className="md:hidden text-xs text-muted-foreground mb-1 block">Rate</Label>
                                            <Input
                                                type="number"
                                                value={line.unitPrice}
                                                onChange={e => updateLine(i, 'unitPrice', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="md:hidden text-xs text-muted-foreground mb-1 block">Tax</Label>
                                            <Select
                                                value={line.taxRateId}
                                                onValueChange={v => updateLine(i, 'taxRateId', v)}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Tax" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {rates.map(r => (
                                                        <SelectItem key={r.id} value={r.id.toString()}>{r.name} ({r.rate.toString()}%)</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Total & Action */}
                                    <div className="md:col-span-1 flex items-center justify-between md:justify-end gap-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-0">
                                        <span className="text-sm font-medium md:hidden">Total:</span>
                                        <span className="font-mono text-sm truncate font-bold">
                                            {calculateInvoiceTotals([{
                                                quantity: line.quantity,
                                                unitPrice: line.unitPrice,
                                                taxRatePercent: 0
                                            }]).subtotal.toFixed(0)}
                                        </span>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(i)} className="md:ml-2">
                                            <Trash className="h-4 w-4 text-red-500 hover:text-red-700" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mt-6">
                        <div className="w-64 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{calculated.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span>{calculated.taxTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                <span>Total (Rounded)</span>
                                <span>{companyProfile.currency} {calculated.roundedTotal.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Exact Total</span>
                                <span>{calculated.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Invoice
                    </Button>
                </div>
            </form>
        </motion.div>
    )
}
