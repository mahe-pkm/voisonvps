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
            await navigator.clipboard.writeText(url)
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
