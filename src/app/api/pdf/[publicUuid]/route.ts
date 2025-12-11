import { NextRequest, NextResponse } from "next/server"
import { chromium } from "playwright"

export async function GET(req: NextRequest, { params }: { params: Promise<{ publicUuid: string }> }) {
    const { publicUuid } = await params
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('mode')

    // Force 3001 if env is 3000 (common mismatch during dev)
    // Use correct env URL or default to localhost:3000 on VPS
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    // Use /print view for full 3-copy pdf
    let printUrl = `${appUrl}/bill/${publicUuid}/print`
    if (mode) {
        printUrl += `?mode=${mode}`
    }

    let browser = null
    try {
        browser = await chromium.launch({
            headless: true,
            // args for limited environments if needed
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        const page = await browser.newPage()

        await page.goto(printUrl, { waitUntil: "networkidle" })

        // PDF Options
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "0", right: "0", bottom: "0", left: "0" }
        })

        return new NextResponse(pdfBuffer as any, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="invoice-${publicUuid}.pdf"`
            }
        })
    } catch (error) {
        console.error("PDF Gen Error:", error)
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
    } finally {
        if (browser) await browser.close()
    }
}
