export interface InvoiceLine {
    description: string
    quantity: number | string
    unitPrice: number | string
    lineTotal?: number | string | null
    hsnSac?: string | null
    taxRate?: {
        rate: number | string
    } | null
}

export interface ClientDetails {
    name: string
    billingAddr: string | null
    shippingAddr: string | null
    gstin: string | null
    state: string | null
    email: string | null
    phone?: string | null
    clientNumber?: string | null
}

export interface InvoiceData {
    invoiceNumber: string
    issueDate: Date | string
    dueDate?: Date | string | null
    placeOfSupply?: string | null
    client: ClientDetails
    lines: InvoiceLine[]
    subtotal: number | string
    taxTotal: number | string
    roundedTotal: number | string
    totalAmount: number | string
    templateName: string
}
