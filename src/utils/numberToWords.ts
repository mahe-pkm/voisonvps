
/**
 * Converts a number to Indian currency words format (Lakhs/Crores).
 * Example: 123456 -> "One Lakh Twenty Three Thousand Four Hundred Fifty Six"
 */
export function numberToWords(amount: number): string {
    const a = [
        "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
        "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
    ];
    const b = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    if ((amount = amount.toString() as any).length > 9) return "overflow";
    const n: any = ('000000000' + amount).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";

    let str = "";

    // Crores
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';

    // Lakhs
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';

    // Thousands
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';

    // Hundreds
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';

    // Tens/Ones (Paise part or last two digits logic if we were doing strictly ints, but usually "and" is nice)
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';

    return str.trim();
}

export function convertAmountToWords(amount: number): string {
    if (isNaN(amount) || amount === 0) return "Zero Rupees Only";

    const integerPart = Math.floor(amount);
    const decimalPart = Math.round((amount - integerPart) * 100);

    let words = "Rupees " + numberToWords(integerPart);

    if (decimalPart > 0) {
        words += " and " + numberToWords(decimalPart) + " Paise";
    }

    return words + " Only";
}
