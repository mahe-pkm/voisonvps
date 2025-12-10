import Decimal from "decimal.js";

type TaxMode = "CGST_SGST" | "IGST" | "UNKNOWN";

export function splitTaxByState(
    totalTax: Decimal,
    originState?: string | null,
    buyerState?: string | null
): { mode: TaxMode; cgst: Decimal; sgst: Decimal; igst: Decimal } {
    if (!originState || !buyerState) {
        return {
            mode: "UNKNOWN",
            cgst: new Decimal(0),
            sgst: new Decimal(0),
            igst: totalTax,
        };
    }

    // Case-insensitive comparison
    if (originState.trim().toLowerCase() === buyerState.trim().toLowerCase()) {
        const half = totalTax.div(2);
        return {
            mode: "CGST_SGST",
            cgst: half,
            sgst: half,
            igst: new Decimal(0),
        };
    }

    return {
        mode: "IGST",
        cgst: new Decimal(0),
        sgst: new Decimal(0),
        igst: totalTax,
    };
}
