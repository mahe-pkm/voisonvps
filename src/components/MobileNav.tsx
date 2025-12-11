"use client"

import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from "@/components/Sidebar"
import { useState, useEffect } from "react"

interface MobileNavProps {
    profiles: any[]
    currentProfileId: string
    userEmail?: string
    userRole?: string
}

export function MobileNav({ profiles, currentProfileId, userEmail, userRole }: MobileNavProps) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    // Close sheet when path changes (navigation)
    useEffect(() => {
        setOpen(false)
    }, [pathname])

    return (
        <div className="md:hidden flex items-center p-4 border-b bg-background sticky top-0 z-50">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 bg-sidebar text-sidebar-foreground border-sidebar-border">
                    <div className="h-full flex flex-col">
                        <SidebarContent
                            profiles={profiles}
                            currentProfileId={currentProfileId}
                            userEmail={userEmail}
                            userRole={userRole}
                            pathname={pathname}
                        />
                    </div>
                </SheetContent>
            </Sheet>
            <div className="ml-4 font-bold text-lg">Invoicer</div>
        </div>

    )
}
