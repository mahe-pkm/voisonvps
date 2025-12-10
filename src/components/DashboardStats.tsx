"use client"

import { motion } from "framer-motion"
import { DollarSign, FileText, Users, Activity } from "lucide-react"

interface DashboardStatsProps {
    receivedAmount: string
    pendingAmount: string
    invoiceCount: number
    clientCount: number
    currency: string
}

export function DashboardStats({ receivedAmount, pendingAmount, invoiceCount, clientCount, currency }: DashboardStatsProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    const stats = [
        {
            label: "Total Revenue",
            value: `${currency} ${receivedAmount}`,
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-900/20",
            border: "border-green-200 dark:border-green-800"
        },
        {
            label: "Pending Amount",
            value: `${currency} ${pendingAmount}`,
            icon: Activity,
            color: "text-orange-600",
            bg: "bg-orange-100 dark:bg-orange-900/20",
            border: "border-orange-200 dark:border-orange-800"
        },
        {
            label: "Invoices",
            value: invoiceCount,
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/20",
            border: "border-blue-200 dark:border-blue-800"
        },
        {
            label: "Clients",
            value: clientCount,
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-900/20",
            border: "border-purple-200 dark:border-purple-800"
        }
    ]

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    variants={item}
                    className={`p-6 bg-white/70 dark:bg-black/40 backdrop-blur-xl border ${stat.border} rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
                >
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className={`text-2xl font-bold tracking-tight ${stat.color}`}>
                            {stat.value}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {index === 0 ? "+12% from last month" : "Updated just now"}
                        </span>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    )
}
