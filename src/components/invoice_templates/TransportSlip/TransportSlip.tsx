import { PrintContainer } from "../PrintContainer"
import { format } from "date-fns"
import { formatCurrency } from "@/utils/calculations"
import { CompanyProfileData } from "@/lib/companyProfile"
import { InvoiceData } from "@/types/invoice"
import { convertAmountToWords } from "@/utils/numberToWords"

export function TransportSlip({ invoice, companyProfile }: { invoice: InvoiceData, companyProfile: CompanyProfileData }) {
    const { client, lines } = invoice
    const subtotalVal = formatCurrency(invoice.subtotal)
    const linesFormatted = lines.map((l) => ({
        ...l,
        lineTotal: l.lineTotal ? formatCurrency(l.lineTotal) : "0.00",
        quantity: l.quantity.toString()
    }))

    return (
        <PrintContainer className="border-2 border-dashed border-gray-400 p-8">
            <div className="text-center mb-6">
                <h1 className="text-xl font-bold uppercase">DELIVERY CHALLAN / TRANSPORT SLIP</h1>
                <p className="text-sm">Not for Sale - For Transport Only</p>
            </div>

            <div className="grid grid-cols-2 gap-8 border p-4 mb-6">
                <div>
                    <p className="font-bold text-xs uppercase text-gray-500">Consignor (From)</p>
                    <p className="font-bold">{companyProfile.name}</p>
                    <p className="whitespace-pre-line text-sm">{companyProfile.address}</p>
                    <p className="text-sm">GSTIN: {companyProfile.gstin}</p>
                </div>
                <div>
                    <p className="font-bold text-xs uppercase text-gray-500">Consignee (To)</p>
                    <p className="font-bold">{client.name}</p>
                    <p className="whitespace-pre-line text-sm">{client.shippingAddr || client.billingAddr}</p>
                    <p className="text-sm">Contact: {client.phone || "-"}</p>
                </div>
            </div>

            <div className="mb-6">
                <table className="w-full text-sm">
                    <tbody>
                        <tr>
                            <td className="font-bold w-32">Invoice No:</td>
                            <td>{invoice.invoiceNumber}</td>
                            <td className="font-bold w-32">Date:</td>
                            <td>{format(new Date(invoice.issueDate), "dd-MMM-yyyy")}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">E-Way Bill No:</td>
                            <td>_________________</td>
                            <td className="font-bold">Vehicle No:</td>
                            <td>_________________</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <table className="w-full border-collapse border border-gray-300 text-sm mb-8">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">S.No</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Qty</th>
                        <th className="border p-2">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {linesFormatted.map((line: any, i: number) => (
                        <tr key={line.id}>
                            <td className="border p-2 text-center">{i + 1}</td>
                            <td className="border p-2">{line.description}</td>
                            <td className="border p-2 text-center">{line.quantity}</td>
                            <td className="border p-2 text-right">{line.lineTotal}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={3} className="border p-2 text-right font-bold">Total Declared Value</td>
                        <td className="border p-2 text-right font-bold">{subtotalVal}</td>
                    </tr>
                    <tr>
                        <td colSpan={4} className="border p-2 text-right text-xs italic uppercase">
                            {convertAmountToWords(parseFloat(invoice.subtotal.toString()))}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="flex justify-between mt-12 pt-8">
                <div>
                    <p className="text-sm">Received the above goods in good condition.</p>
                    <br />
                    <p className="text-xs font-bold pt-8 border-t w-48">Receiver's Signature</p>
                </div>
                <div className="text-center">
                    <p className="font-bold">For {companyProfile.name}</p>
                    <br /><br />
                    <p className="text-xs font-bold pt-2">Authorized Signatory</p>
                </div>
            </div>
        </PrintContainer>
    )
}
