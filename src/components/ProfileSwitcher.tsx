"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { switchProfile } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Profile {
    id: string
    name: string
    isDefault: boolean
}

interface ProfileSwitcherProps {
    profiles: Profile[]
    currentProfileId?: string | null
}

export function ProfileSwitcher({ profiles, currentProfileId }: ProfileSwitcherProps) {
    const router = useRouter()

    async function onValueChange(val: string) {
        if (val === "new") {
            router.push("/dashboard/settings/profiles/new")
            return
        }

        try {
            await switchProfile(val)
            toast.success("Profile switched")
            router.refresh()
        } catch (e) {
            toast.error("Failed to switch profile")
        }
    }

    // Determine active ID
    // If currentProfileId matches one in list, use it.
    // If not, maybe use default?
    const activeId = currentProfileId && profiles.some(p => p.id === currentProfileId)
        ? currentProfileId
        : profiles.find(p => p.isDefault)?.id || (profiles.length > 0 ? profiles[0].id : undefined)

    if (profiles.length === 0) {
        return (
            <button
                onClick={() => router.push("/dashboard/settings/profiles/new")}
                className="text-sm font-medium text-emerald-600 hover:underline"
            >
                + Create Seller Profile
            </button>
        )
    }

    return (
        <Select value={activeId} onValueChange={onValueChange}>
            <SelectTrigger className="w-full max-w-[200px] h-8 text-xs bg-muted/50 border-input/50">
                <SelectValue placeholder="Select Profile" />
            </SelectTrigger>
            <SelectContent>
                {profiles.map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.name}
                    </SelectItem>
                ))}
                <div className="border-t my-1" />
                <SelectItem value="new" className="text-xs font-bold text-emerald-600">
                    + Add New Profile
                </SelectItem>
            </SelectContent>
        </Select>
    )
}
