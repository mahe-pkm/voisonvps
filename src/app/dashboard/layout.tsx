import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { getCurrentProfileId } from "@/lib/currentProfile"
import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/auth/login")
    }

    const userId = parseInt(session.user.id)
    const profiles = await prisma.companyProfile.findMany({
        where: { userId },
        orderBy: { name: "asc" }
    })
    const currentProfileId = await getCurrentProfileId()

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-background to-background dark:from-blue-950/30 dark:via-background dark:to-background">
            {/* Mobile Navigation (Hamburger) */}
            <MobileNav
                profiles={profiles}
                currentProfileId={currentProfileId || ""}
                userEmail={session.user?.email || ""}
                userRole={session.user?.role || "User"}
            />

            {/* Animated & Glass Sidebar (Desktop) */}
            <Sidebar
                profiles={profiles}
                currentProfileId={currentProfileId || ""}
                userEmail={session.user?.email || ""}
                userRole={session.user?.role || "User"}
            />

            {/* Main Content Area */}
            <main className="flex-1 md:pl-72 transition-all duration-300">
                <div className="container mx-auto p-4 md:p-8 max-w-7xl pt-20 md:pt-8 min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    )
}
