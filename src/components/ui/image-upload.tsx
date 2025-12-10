
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    label: string
    recommendedDimensions?: string
}

export function ImageUpload({ value, onChange, label, recommendedDimensions }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Basic validation
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file")
            return
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB
            toast.error("Image size should be less than 2MB")
            return
        }

        const formData = new FormData()
        formData.append("file", file)

        setUploading(true)
        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            if (!res.ok) throw new Error("Upload failed")

            const data = await res.json()
            onChange(data.url)
            toast.success("Image uploaded successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to upload image")
        } finally {
            setUploading(false)
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-start gap-4">
                {value ? (
                    <div className="relative group">
                        <div className="w-24 h-24 relative border rounded-md overflow-hidden bg-slate-50">
                            <img
                                src={value}
                                alt={label}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                ) : (
                    <div className="w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-slate-50 text-slate-300">
                        <ImageIcon className="size-8" />
                    </div>
                )}

                <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                        <Input
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="https://... or upload"
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={uploading}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {uploading ? "Uploading..." : <><Upload className="mr-2 size-4" /> Upload</>}
                        </Button>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {recommendedDimensions && (
                        <p className="text-xs text-muted-foreground">
                            Recommended: {recommendedDimensions}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
