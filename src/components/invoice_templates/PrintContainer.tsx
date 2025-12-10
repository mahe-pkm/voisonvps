"use client"

import { cn } from "@/lib/utils"

interface PrintContainerProps {
    children: React.ReactNode
    className?: string
    watermarkText?: string
}

export function PrintContainer({ children, className, watermarkText }: PrintContainerProps) {
    // A4 size references:
    // A4 @ 96 DPI: 794px x 1123px
    // We use standard 'A4' styles from globals.css plus specific padding
    return (
        <div
            className={cn("bg-white text-black mx-auto shadow-lg print:shadow-none print:w-full max-w-[210mm] min-h-[297mm] p-8 relative overflow-hidden", className)}
            data-watermark={watermarkText || ""}
        >
            {children}
        </div>
    )
}
