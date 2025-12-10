import { PrintContainer } from "../PrintContainer"
import { format } from "date-fns"
import { formatCurrency } from "@/utils/calculations"
import { splitTaxByState } from "@/utils/tax"
import Decimal from "decimal.js"
import { CompanyProfileData } from "@/lib/companyProfile"
import { InvoiceData } from "@/types/invoice"
import { convertAmountToWords } from "@/utils/numberToWords"

export function TemplateB({ invoice, copyMode, companyProfile }: { invoice: InvoiceData, copyMode?: string, companyProfile: CompanyProfileData }) {
    const { client, lines } = invoice
    const taxBreakdown = splitTaxByState(new Decimal(invoice.taxTotal), companyProfile.state, client.state || "")
    const isInterState = taxBreakdown.mode === "IGST"
    const bank = companyProfile.bankDetails

    // Pre-format
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

    return (
        <PrintContainer watermarkText={copyMode}>
            {/* Decorative Header */}
            <div className="bg-slate-800 text-white p-8 -mx-8 -mt-8 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-wider">{companyProfile.name}</h1>
                        <p className="mt-2 text-slate-300 text-sm whitespace-pre-line">{companyProfile.address}</p>
                        <p className="text-sm text-slate-300 mt-1">GSTIN: {companyProfile.gstin}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-light opacity-80">INVOICE</h2>
                        <p className="mt-2 font-mono">#{invoice.invoiceNumber}</p>
                        {copyMode && <span className="text-xs border border-white/30 px-2 py-1 rounded mt-2 inline-block uppercase">{copyMode}</span>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mb-8">
                <div>
                    <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Billed To</h3>
                    <p className="font-bold text-lg text-slate-800">{client.name}</p>
                    <p className="text-sm text-slate-600 whitespace-pre-line mt-1">{client.billingAddr}</p>
                    <p className="text-sm text-slate-600 mt-1">GSTIN: {client.gstin || "N/A"}</p>
                    <p className="text-sm text-slate-600">State: {client.state}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-slate-500">Date Issued</p>
                        <p className="font-bold">{format(new Date(invoice.issueDate), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Due Date</p>
                        <p className="font-bold">{invoice.dueDate ? format(new Date(invoice.dueDate), "MMM dd, yyyy") : "-"}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Place of Supply</p>
                        <p className="font-bold">{invoice.placeOfSupply || client.state}</p>
                    </div>
                </div>
            </div>

            {/* Items */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-slate-800 text-left text-sm font-bold text-slate-800">
                        <th className="py-2">Item Description</th>
                        <th className="py-2 text-center">HSN</th>
                        <th className="py-2 text-right">Qty</th>
                        <th className="py-2 text-right">Tax %</th>
                        <th className="py-2 text-right">Rate</th>
                        <th className="py-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-slate-600">
                    {linesFormatted.map((line: any, index: number) => (
                        <tr key={line.id || index} className="border-b border-slate-100">
                            <td className="py-3 font-medium">{line.description}</td>
                            <td className="py-3 text-center text-xs">{line.hsnSac || "-"}</td>
                            <td className="py-3 text-right">{line.quantity}</td>
                            <td className="py-3 text-right">{line.taxRate?.rate ? `${line.taxRate.rate}%` : "-"}</td>
                            <td className="py-3 text-right">{line.unitPrice}</td>
                            <td className="py-3 text-right text-slate-800">{line.lineTotal}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
                <div className="w-2/5 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span>{subtotalVal}</span>
                    </div>
                    {isInterState ? (
                        <div className="flex justify-between text-slate-500">
                            <span>IGST</span>
                            <span>{igstVal}</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between text-slate-500">
                                <span>CGST</span>
                                <span>{cgstVal}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>SGST</span>
                                <span>{sgstVal}</span>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between font-bold text-xl text-slate-800 border-t-2 border-slate-800 pt-2">
                        <span>Total</span>
                        <span>{companyProfile.currency} {roundedTotalVal}</span>
                    </div>
                    <div className="mt-2 text-right text-xs italic text-slate-500 uppercase">
                        {convertAmountToWords(parseFloat(invoice.roundedTotal.toString()))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="grid grid-cols-2 gap-8 mt-auto pt-8 border-t border-slate-200 avoid-break-inside">
                <div className="text-xs text-slate-500 space-y-1">
                    <p className="font-bold text-slate-800 mb-2">Payment Details</p>
                    <p>Account Name: <span className="font-mono">{bank.name}</span></p>
                    <p>Account No: <span className="font-mono">{bank.accountNo}</span></p>
                    <p>IFSC Code: <span className="font-mono">{bank.ifsc}</span></p>
                    <p>Branch: {bank.branch}</p>
                </div>
                <div className="flex flex-col items-end">
                    {companyProfile.signatureUrl && (
                        <img src={companyProfile.signatureUrl} alt="Sign" className="h-12 mb-2" />
                    )}
                    <p className="text-sm font-bold">{companyProfile.name}</p>
                    <p className="text-xs text-slate-500">Authorized Signatory</p>
                </div>
            </div>
        </PrintContainer>
    )
}
