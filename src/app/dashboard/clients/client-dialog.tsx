"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient, updateClient, deleteClient } from "./actions"
import { MoreHorizontal, Pencil, Trash, Loader2 } from "lucide-react"
import { INDIAN_STATES } from "@/lib/constants"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Client = {
    id: number
    name: string
    gstin: string | null
    email: string | null
    phone: string | null
    state: string | null
    billingAddr: string | null
    shippingAddr: string | null
    clientNumber: string | null
    openingBalance: any // Decimal coming from server, simplified for UI
}

interface ClientDialogProps {
    mode: "create" | "edit"
    client?: Client
    children?: React.ReactNode
}

export function ClientDialog({ mode, client, children }: ClientDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        let result

        if (mode === "create") {
            result = await createClient(formData)
        } else if (client) {
            result = await updateClient(client.id, formData)
        }

        setIsLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(`Client ${mode === "create" ? "created" : "updated"} successfully`)
            setOpen(false)
            router.refresh()
        }
    }

    async function handleDelete() {
        if (!client || !confirm("Are you sure you want to delete this client?")) return

        const result = await deleteClient(client.id)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Client deleted")
            setOpen(false)
            router.refresh()
        }
    }

    if (mode === "edit" && !children) {
        children = (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Add Client" : "Edit Client"}</DialogTitle>
                    <DialogDescription>
                        {mode === "create" ? "Add a new client to your database." : "Make changes to client details."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={client?.name}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gstin" className="text-right">GSTIN</Label>
                            <Input
                                id="gstin"
                                name="gstin"
                                defaultValue={client?.gstin || ""}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="clientNumber" className="text-right">Unique No.</Label>
                            <Input
                                id="clientNumber"
                                name="clientNumber"
                                placeholder="Auto-generated if empty"
                                defaultValue={client?.clientNumber || ""}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="openingBalance" className="text-right">Opening Bal</Label>
                            <Input
                                id="openingBalance"
                                name="openingBalance"
                                type="number"
                                step="0.01"
                                defaultValue={client?.openingBalance ? client.openingBalance.toString() : "0.00"}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="state" className="text-right">State</Label>
                            <div className="col-span-3">
                                <Select name="state" defaultValue={client?.state || "Tamil Nadu"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDIAN_STATES.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={client?.email || ""}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Phone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={client?.phone || ""}
                                className="col-span-3"
                            />
                        </div>
                        {/* Address fields simplified for brevity, assume simple text/textarea */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="billingAddr" className="text-right">Bill Addr</Label>
                            <Input id="billingAddr" name="billingAddr" defaultValue={client?.billingAddr || ""} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="shippingAddr" className="text-right">Ship Addr</Label>
                            <Input id="shippingAddr" name="shippingAddr" defaultValue={client?.shippingAddr || ""} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === "create" ? "Create Client" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
