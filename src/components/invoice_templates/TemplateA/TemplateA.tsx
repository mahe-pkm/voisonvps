import { PrintContainer } from "../PrintContainer"
import { format } from "date-fns"
import { formatCurrency } from "@/utils/calculations"
import { splitTaxByState } from "@/utils/tax"
import Decimal from "decimal.js"
import { CompanyProfileData } from "@/lib/companyProfile"
import { InvoiceData } from "@/types/invoice"
import { convertAmountToWords } from "@/utils/numberToWords"

export function TemplateA({ invoice, copyMode, companyProfile }: { invoice: InvoiceData, copyMode?: string, companyProfile: CompanyProfileData }) {
    const { client, lines } = invoice
    const isOriginal = !copyMode || copyMode === "Original"

    // Tax Logic
    const taxBreakdown = splitTaxByState(new Decimal(invoice.taxTotal), companyProfile.state, client.state || "")
    const isInterState = taxBreakdown.mode === "IGST"

    // Pre-format to ensure primitives in JSX
    const igstVal = formatCurrency(taxBreakdown.igst)
    const cgstVal = formatCurrency(taxBreakdown.cgst)
    const sgstVal = formatCurrency(taxBreakdown.sgst)
    const subtotalVal = formatCurrency(invoice.subtotal)
    const roundedTotalVal = formatCurrency(invoice.roundedTotal)
    const linesFormatted = lines.map((l) => ({
        ...l,
        unitPrice: formatCurrency(l.unitPrice),
        lineTotal: l.lineTotal ? formatCurrency(l.lineTotal) : "0.00",
        quantity: l.quantity.toString()
    }))

    // Bank Details
    const bank = companyProfile.bankDetails

    return (
        <PrintContainer watermarkText={copyMode}>
            {/* Header */}
            <div className="flex justify-between border-b pb-4 mb-4">
                <div className="flex items-start gap-4 w-2/3">
                    {companyProfile.logoUrl && (
                        <img
                            src={companyProfile.logoUrl}
                            alt="Logo"
                            className="w-20 h-20 object-contain"
                        />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold uppercase text-primary">{companyProfile.name}</h1>
                        <div className="text-sm mt-1 whitespace-pre-line text-muted-foreground">
                            {companyProfile.address}
                        </div>
                        <p className="text-sm font-semibold mt-2">GSTIN: {companyProfile.gstin}</p>
                    </div>
                </div>
                <div className="w-1/3 text-right">
                    <h2 className="text-xl font-bold text-gray-800">TAX INVOICE</h2>
                    {copyMode && <p className="text-xs uppercase font-medium border px-1 inline-block mt-1">{copyMode}</p>}
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-12 gap-4 mb-6 text-sm">
                <div className="col-span-4 border p-4 rounded-sm">
                    <h3 className="font-bold mb-2 bg-gray-100 p-1">BILL TO</h3>
                    <p className="font-bold">{client.name}</p>
                    <p className="whitespace-pre-line">{client.billingAddr}</p>
                    <p className="mt-2 text-xs">GSTIN: {client.gstin || "N/A"}</p>
                    <p className="text-xs">State: {client.state}</p>
                </div>
                <div className="col-span-4 border p-4 rounded-sm">
                    <h3 className="font-bold mb-2 bg-gray-100 p-1">SHIP TO</h3>
                    <p className="whitespace-pre-line">{client.shippingAddr || client.billingAddr}</p>
                </div>
                <div className="col-span-4 border p-4 rounded-sm">
                    <h3 className="font-bold mb-2 bg-gray-100 p-1">INVOICE DETAILS</h3>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                        <span>Invoice No:</span> <span className="font-bold">{invoice.invoiceNumber}</span>
                        <span>Date:</span> <span className="font-bold">{format(new Date(invoice.issueDate), "dd-MMM-yyyy")}</span>
                        {invoice.dueDate && <><span>Due Date:</span> <span>{format(new Date(invoice.dueDate), "dd-MMM-yyyy")}</span></>}
                        <span>Place of Supply:</span> <span>{invoice.placeOfSupply || client.state}</span>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-sm border-collapse mb-6">
                <thead>
                    <tr className="bg-gray-100 border text-left">
                        <th className="border p-2 w-10 text-center">#</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2 w-16 text-center">HSN/SAC</th>
                        <th className="border p-2 w-16 text-right">Qty</th>
                        <th className="border p-2 w-16 text-right">Tax %</th>
                        <th className="border p-2 w-24 text-right">Rate</th>
                        <th className="border p-2 w-24 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {linesFormatted.map((line: any, index: number) => (
                        <tr key={line.id || index} className="border-b">
                            <td className="border p-2 text-center">{index + 1}</td>
                            <td className="border p-2">
                                <p className="font-medium">{line.description}</p>
                            </td>
                            <td className="border p-2 text-center">{line.hsnSac || "-"}</td>
                            <td className="border p-2 text-right">{line.quantity} {line.unit}</td>
                            <td className="border p-2 text-right">{line.taxRate?.rate ? `${line.taxRate.rate}%` : "-"}</td>
                            <td className="border p-2 text-right">{line.unitPrice}</td>
                            <td className="border p-2 text-right">{line.lineTotal}</td>
                        </tr>
                    ))}
                    {/* Empty rows filler if needed */}
                </tbody>
            </table>

            {/* Footer Calculation */}
            <div className="flex justify-end mb-6 text-sm">
                <div className="w-1/2 border">
                    <div className="flex justify-between p-2 border-b">
                        <span>Sub Total</span>
                        <span>{subtotalVal}</span>
                    </div>
                    {isInterState ? (
                        <div className="flex justify-between p-2 border-b">
                            <span>IGST</span>
                            <span>{igstVal}</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between p-2 border-b">
                                <span>CGST</span>
                                <span>{cgstVal}</span>
                            </div>
                            <div className="flex justify-between p-2 border-b">
                                <span>SGST</span>
                                <span>{sgstVal}</span>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between p-2 bg-gray-100 font-bold border-b">
                        <span>Rounded Total</span>
                        <span>{companyProfile.currency} {roundedTotalVal}</span>
                    </div>
                    <div className="p-2 text-xs text-right italic text-muted-foreground border-b uppercase">
                        {convertAmountToWords(parseFloat(invoice.roundedTotal.toString()))}
                    </div>
                    <div className="p-2 text-xs text-right">
                        {/* Word amount: Would need a converter library 'number-to-words' */}
                    </div>
                </div>
            </div>

            {/* Bank & Sign */}
            <div className="grid grid-cols-2 gap-8 text-sm mt-auto avoid-break-inside">
                <div>
                    <h4 className="font-bold underline mb-2">Bank Details</h4>
                    <p>Bank: {bank.name}</p>
                    <p>A/c No: {bank.accountNo}</p>
                    <p>Branch: {bank.branch}</p>
                    <p>IFSC: {bank.ifsc}</p>

                    <div className="mt-4 border p-2 text-xs">
                        <p className="font-bold">Terms & Conditions:</p>
                        <div className="whitespace-pre-line mt-1">
                            {companyProfile.termsAndConditions || (
                                <>
                                    Goods once sold will not be taken back.<br />
                                    Interest @ 18% p.a. will be charged for delayed payment.<br />
                                    Subject to {companyProfile.state} Jurisdiction only.
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                    {companyProfile.upiQrUrl && (
                        <div className="mb-2">
                            <img src={companyProfile.upiQrUrl} alt="UPI QR" className="w-24 h-24 border" />
                            <p className="text-xs text-center">Scan to Pay</p>
                        </div>
                    )}
                    <div className="text-center mt-4">
                        <p className="font-bold mb-8">For {companyProfile.name}</p>
                        {/* Seal/Sign Image Placeholders */}
                        <div className="h-16">
                            {companyProfile.sealUrl && <img src={companyProfile.sealUrl} className="h-full inline opacity-80" alt="Seal" />}
                            {companyProfile.signatureUrl && <img src={companyProfile.signatureUrl} className="h-full inline -ml-8" alt="Sign" />}
                        </div>
                        <p className="text-xs mt-1">Authorized Signatory</p>
                    </div>
                </div>
            </div>
        </PrintContainer>
    )
}
