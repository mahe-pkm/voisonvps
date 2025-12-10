
export const companyConfig = {
    name: process.env.COMPANY_NAME || "Demo Company",
    address: process.env.COMPANY_ADDRESS || "No. 1, Demo Street",
    state: process.env.COMPANY_STATE || "Tamil Nadu",
    gstin: process.env.COMPANY_GSTIN || "29ABCDE1234F1Z5",
    bankDetails: {
        name: process.env.COMPANY_BANK_NAME,
        branch: process.env.COMPANY_BANK_BRANCH,
        accountNo: process.env.COMPANY_BANK_ACCOUNT_NO,
        ifsc: process.env.COMPANY_BANK_IFSC,
    },
    sealUrl: process.env.COMPANY_SEAL_IMAGE_URL,
    signatureUrl: process.env.COMPANY_SIGNATURE_IMAGE_URL,
    upiQrUrl: process.env.UPI_QR_IMAGE_URL,
    paymentTerms: "15 Days",
};
