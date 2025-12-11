"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { INDIAN_STATES } from "@/lib/constants"
import { ImageUpload } from "@/components/ui/image-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { CompanyProfileData } from "@/lib/companyProfile"
import { updateCompanyProfile } from "@/app/dashboard/settings/actions"

export function CompanyProfileForm({ initialData }: { initialData: CompanyProfileData }) {
    // ... state logic remains the same ...
    const [data, setData] = useState(initialData)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            await updateCompanyProfile(data)
            toast.success("Settings updated successfully")
        } catch (err) {
            toast.error("Failed to update settings")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-card text-card-foreground p-6 rounded-md border shadow-sm">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input id="name" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} required />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" value={data.address} onChange={e => setData({ ...data, address: e.target.value })} required />
                </div>
                <div className="space-y-2">
                    <Label>State</Label>
                    <Select value={data.state} onValueChange={v => setData({ ...data, state: v })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                            {INDIAN_STATES.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input id="gstin" value={data.gstin} onChange={e => setData({ ...data, gstin: e.target.value })} required />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label>Currency Symbol</Label>
                    <Select value={data.currency} onValueChange={v => setData({ ...data, currency: v })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="₹">₹ (INR)</SelectItem>
                            <SelectItem value="$">$ (USD)</SelectItem>
                            <SelectItem value="€">€ (EUR)</SelectItem>
                            <SelectItem value="£">£ (GBP)</SelectItem>
                            <SelectItem value="AED">AED</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border-t pt-4">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Bank Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input id="bankName" value={data.bankDetails.name || ""} onChange={e => setData({ ...data, bankDetails: { ...data.bankDetails, name: e.target.value } })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bankBranch">Branch</Label>
                        <Input id="bankBranch" value={data.bankDetails.branch || ""} onChange={e => setData({ ...data, bankDetails: { ...data.bankDetails, branch: e.target.value } })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountNo">Account No</Label>
                        <Input id="accountNo" value={data.bankDetails.accountNo || ""} onChange={e => setData({ ...data, bankDetails: { ...data.bankDetails, accountNo: e.target.value } })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ifsc">IFSC</Label>
                        <Input id="ifsc" value={data.bankDetails.ifsc || ""} onChange={e => setData({ ...data, bankDetails: { ...data.bankDetails, ifsc: e.target.value } })} />
                    </div>
                </div>
            </div>

            <div className="border-t pt-4">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Images</h3>
                <div className="grid grid-cols-1 gap-6">
                    <ImageUpload
                        label="Company Logo"
                        value={data.logoUrl || ""}
                        onChange={v => setData({ ...data, logoUrl: v })}
                        recommendedDimensions="Square, 512x512px recommended"
                    />
                    <ImageUpload
                        label="Seal / Stamp"
                        value={data.sealUrl || ""}
                        onChange={v => setData({ ...data, sealUrl: v })}
                        recommendedDimensions="Circular or Square, approx 200x200px"
                    />
                    <ImageUpload
                        label="Authorized Signature"
                        value={data.signatureUrl || ""}
                        onChange={v => setData({ ...data, signatureUrl: v })}
                        recommendedDimensions="Landscape, approx 300x100px (Transparent background)"
                    />
                    <ImageUpload
                        label="UPI QR Code"
                        value={data.upiQrUrl || ""}
                        onChange={v => setData({ ...data, upiQrUrl: v })}
                        recommendedDimensions="Square, approx 300x300px"
                    />
                </div>
            </div>

            <div className="border-t pt-4">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Standard Terms</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="terms">Terms & Conditions (Footer)</Label>
                        <Textarea
                            id="terms"
                            rows={4}
                            value={data.termsAndConditions || ""}
                            onChange={e => setData({ ...data, termsAndConditions: e.target.value })}
                            placeholder="Goods once sold..."
                        />
                    </div>
                </div>
            </div>

            <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
            </Button>
        </form>
    )
}
