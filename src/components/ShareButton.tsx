"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { toast } from "sonner"

interface ShareButtonProps {
    url: string
}

export function ShareButton({ url }: ShareButtonProps) {
    const handleShare = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url)
            } else {
                // Fallback for HTTP (Unsecured)
                const textArea = document.createElement("textarea")
                textArea.value = url
                textArea.style.position = "fixed"
                textArea.style.left = "-9999px"
                textArea.style.top = "0"
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()
                try {
                    document.execCommand('copy')
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err)
                }
                document.body.removeChild(textArea)
            }
            toast.success("Link copied to clipboard!")
        } catch (err) {
            toast.error("Failed to copy link")
        }
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleShare} title="Copy Public Link">
            <Share2 className="h-4 w-4 text-green-600" />
        </Button>
    )
}
