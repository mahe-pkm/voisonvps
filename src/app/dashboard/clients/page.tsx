import { prisma } from "@/lib/prisma"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ClientDialog } from "./client-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function ClientsPage() {
    const clients = await prisma.client.findMany({
        orderBy: { createdAt: "desc" },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
                <ClientDialog mode="create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Client
                    </Button>
                </ClientDialog>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>GSTIN</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No clients found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-mono text-xs">
                                        <a href={`/dashboard/clients/${client.id}`} className="hover:underline text-primary">
                                            {client.clientNumber || "N/A"}
                                        </a>
                                    </TableCell>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>{client.gstin || "-"}</TableCell>
                                    <TableCell>{client.email || "-"}</TableCell>
                                    <TableCell>{client.state || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        <ClientDialog mode="edit" client={client} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
