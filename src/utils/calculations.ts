import Decimal from "decimal.js";

// Ensure enough precision
Decimal.set({ precision: 20 });

export const calculateLineTotal = (quantity: Decimal | number | string, unitPrice: Decimal | number | string) => {
    return new Decimal(quantity).mul(new Decimal(unitPrice));
};

export const calculateTaxAmount = (taxableValue: Decimal, taxRatePercent: number) => {
    return taxableValue.mul(taxRatePercent).div(100);
};

export const roundToNearestRupee = (amount: Decimal) => {
    // GST rounding rule: Nearest Rupee. 0.50 and above rounded up.
    // decimal.js round() defaults to half-up.
    return amount.round();
};

export const calculateInvoiceTotals = (
    lines: {
        quantity: string | number | Decimal;
        unitPrice: string | number | Decimal;
        taxRatePercent: number; // e.g. 18
    }[]
) => {
    let subtotal = new Decimal(0);
    let taxTotal = new Decimal(0);

    lines.forEach((line) => {
        const qty = new Decimal(line.quantity);
        const price = new Decimal(line.unitPrice);
        const lineTotal = qty.mul(price);

        const taxAmount = lineTotal.mul(line.taxRatePercent).div(100);

        subtotal = subtotal.add(lineTotal);
        taxTotal = taxTotal.add(taxAmount);
    });

    const totalAmount = subtotal.add(taxTotal);
    const roundedTotal = roundToNearestRupee(totalAmount);

    return {
        subtotal,
        taxTotal,
        totalAmount,
        roundedTotal,
    };
};

export function formatCurrency(amount: Decimal | number | string) {
    const val = new Decimal(amount);
    return val.toFixed(2); // e.g. 1200.00
}
