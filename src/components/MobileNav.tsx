"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
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
        <div className="md:hidden flex items-center justify-between p-4 border-b border-sidebar-border bg-background/80 backdrop-blur-md sticky top-0 z-50 h-16">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden -ml-2">
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

            <Link href="/dashboard" className="font-bold text-lg flex items-center gap-2 cursor-pointer">
                <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">I</div>
                Invoicer
            </Link>

            <div className="w-10 flex justify-end">
                {/* Placeholder for balance check or profile avatar if needed later */}
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs shadow-sm">
                    {userEmail?.[0].toUpperCase()}
                </div>
            </div>
        </div>

    )
}
