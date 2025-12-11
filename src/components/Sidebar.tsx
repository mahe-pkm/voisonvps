"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    PlusCircle,
    ChevronRight,
} from "lucide-react"
import { ProfileSwitcher } from "@/components/ProfileSwitcher"

interface SidebarProps {
    profiles: any[]
    currentProfileId: string
    userEmail?: string
    userRole?: string
}

// Reusable Sidebar Content for Mobile/Desktop
export function SidebarContent({ profiles, currentProfileId, userEmail, userRole, pathname }: SidebarProps & { pathname: string }) {
    const links = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/invoices/new", label: "New Invoice", icon: PlusCircle },
        { href: "/dashboard/invoices", label: "All Invoices", icon: FileText },
        { href: "/dashboard/clients", label: "Clients", icon: Users },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ]

    return (
        <>
            <div className="p-6 border-b border-sidebar-border">
                <Link href="/dashboard" className="flex items-center gap-2 mb-6 cursor-pointer transition-opacity hover:opacity-80">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                        I
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Invoicer
                    </span>
                </Link>
                <ProfileSwitcher profiles={profiles} currentProfileId={currentProfileId} />
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href

                    return (
                        <Link key={link.href} href={link.href} className="block relative group">
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div className={`
                                relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200
                                ${isActive ? 'text-sidebar-primary font-bold bg-sidebar-accent' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'}
                            `}>
                                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px] text-sidebar-primary' : 'stroke-2'}`} />
                                <span className="flex-1">{link.label}</span>
                                {isActive && (
                                    <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
                                        <ChevronRight className="h-4 w-4" />
                                    </motion.div>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10 m-4 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-3 px-2 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                        {userEmail?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{userEmail}</p>
                        <p className="text-xs text-muted-foreground truncate capitalize">{userRole}</p>
                    </div>
                </div>
                <Link
                    href="/api/auth/signout"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                >
                    <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                </Link>
            </div>

            <div className="px-8 pb-6 text-[10px] text-center text-sidebar-foreground/30 font-medium">
                <div className="uppercase tracking-widest mb-1">Developed by Dev.Roughclick</div>
                <div className="text-[9px]">v0.1.0</div>
            </div>
        </>
    )
}

export function Sidebar({ profiles, currentProfileId, userEmail, userRole }: SidebarProps) {
    const pathname = usePathname()

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-72 hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl"
        >
            <SidebarContent
                profiles={profiles}
                currentProfileId={currentProfileId}
                userEmail={userEmail}
                userRole={userRole}
                pathname={pathname}
            />
        </motion.aside>
    )
}
