import { PrintContainer } from "../PrintContainer"
import { format } from "date-fns"
import { formatCurrency } from "@/utils/calculations"
import { splitTaxByState } from "@/utils/tax"
import Decimal from "decimal.js"
import { CompanyProfileData } from "@/lib/companyProfile"
import { InvoiceData } from "@/types/invoice"
import { convertAmountToWords } from "@/utils/numberToWords"

export function TemplateC({ invoice, copyMode, companyProfile }: { invoice: InvoiceData, copyMode?: string, companyProfile: CompanyProfileData }) {
    const { client, lines } = invoice
    const taxBreakdown = splitTaxByState(new Decimal(invoice.taxTotal), companyProfile.state, client.state || "")
    const isInterState = taxBreakdown.mode === "IGST"

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
        <PrintContainer watermarkText={copyMode} className="font-serif text-black">
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-xl font-bold uppercase tracking-widest">{companyProfile.name}</h1>
                <p className="text-xs uppercase mt-1">{companyProfile.address.replace(/\n/g, ", ")}</p>
                <p className="text-xs font-bold mt-1">GSTIN: {companyProfile.gstin}</p>
            </div>

            <div className="flex justify-between mb-8">
                <div className="w-1/2">
                    <p className="font-bold underline text-xs uppercase mb-2">To:</p>
                    <p className="font-bold">{client.name}</p>
                    <p className="text-sm leading-tight">{client.billingAddr}</p>
                    <p className="text-sm mt-1">GSTIN: {client.gstin}</p>
                </div>
                <div className="w-1/2 text-right">
                    <h2 className="text-2xl font-bold mb-2">INVOICE</h2>
                    <table className="ml-auto text-sm">
                        <tbody>
                            <tr>
                                <td className="pr-4 text-gray-600">No:</td>
                                <td className="font-bold">{invoice.invoiceNumber}</td>
                            </tr>
                            <tr>
                                <td className="pr-4 text-gray-600">Date:</td>
                                <td className="font-bold">{format(new Date(invoice.issueDate), "dd MMM yyyy")}</td>
                            </tr>
                            {copyMode && (
                                <tr>
                                    <td className="pr-4 text-gray-600">Copy:</td>
                                    <td className="uppercase text-xs border border-black px-1">{copyMode}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <table className="w-full border-collapse border border-black mb-6 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-2 w-12">S.No</th>
                        <th className="border border-black p-2 text-left">Description</th>
                        <th className="border border-black p-2 w-20">HSN</th>
                        <th className="border border-black p-2 w-16">Qty</th>
                        <th className="border border-black p-2 w-16">Tax %</th>
                        <th className="border border-black p-2 w-24">Rate</th>
                        <th className="border border-black p-2 w-28">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {linesFormatted.map((line: any, idx: number) => (
                        <tr key={idx}>
                            <td className="border border-black p-2 text-center">{idx + 1}</td>
                            <td className="border border-black p-2">{line.description}</td>
                            <td className="border border-black p-2 text-center">{line.hsnSac || ""}</td>
                            <td className="border border-black p-2 text-center">{line.quantity}</td>
                            <td className="border border-black p-2 text-center">{line.taxRate?.rate ? `${line.taxRate.rate}%` : "-"}</td>
                            <td className="border border-black p-2 text-right">{line.unitPrice}</td>
                            <td className="border border-black p-2 text-right">{line.lineTotal}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end mb-12">
                <table className="text-sm w-1/3">
                    <tbody>
                        <tr>
                            <td className="py-1">Sub Total:</td>
                            <td className="text-right">{subtotalVal}</td>
                        </tr>
                        {isInterState ? (
                            <tr>
                                <td className="py-1">IGST:</td>
                                <td className="text-right">{igstVal}</td>
                            </tr>
                        ) : (
                            <>
                                <tr>
                                    <td className="py-1">CGST:</td>
                                    <td className="text-right">{cgstVal}</td>
                                </tr>
                                <tr>
                                    <td className="py-1">SGST:</td>
                                    <td className="text-right">{sgstVal}</td>
                                </tr>
                            </>
                        )}
                        <tr className="font-bold text-lg border-t border-black border-double">
                            <td className="py-2">Grand Total:</td>
                            <td className="py-2 text-right">{companyProfile.currency} {roundedTotalVal}</td>
                        </tr>
                        <tr>
                            <td colSpan={2} className="py-2 text-xs italic text-right border-t border-gray-300 uppercase">
                                {convertAmountToWords(parseFloat(invoice.roundedTotal.toString()))}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-auto pt-4 border-t border-black flex justify-between items-end avoid-break-inside">
                <div className="text-xs">
                    <p className="font-bold">Terms:</p>
                    <p>1. Payment due within {companyProfile.paymentTerms || "15 days"}.</p>
                    <p>2. Making payment to: {companyProfile.bankDetails.name}, A/c: {companyProfile.bankDetails.accountNo}.</p>
                </div>
                <div className="text-center">
                    {companyProfile.sealUrl && <img src={companyProfile.sealUrl} className="h-16 opacity-50 block mx-auto" />}
                    <p className="font-bold mt-2">{companyProfile.name}</p>
                    <div className="border-t border-black w-32 mt-8"></div>
                    <p className="text-xs mt-1">Authorized Signatory</p>
                </div>
            </div>

        </PrintContainer>
    )
}
