import { prisma } from "@repo/database";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { List, Kanban, Plus } from "lucide-react";
import { KanbanBoardClient } from "../../../../components/repairs/KanbanBoardClient";

export const dynamic = "force-dynamic";

export default async function RepairsBoardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // Fetch active repairs
  const repairs = await prisma.repair.findMany({
    where: {
      status: { notIn: ["DELIVERED", "CANCELLED"] }
    },
    include: {
      customer: { select: { firstName: true, lastName: true } },
      device: { select: { manufacturer: true, model: true } },
      issues: { select: { id: true, issueType: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const technicians = await prisma.staff.findMany({
    where: { isActive: true, role: { in: ["TECHNICIAN", "MANAGER", "OWNER"] } },
    select: { id: true, name: true }
  });

  return (
    <div className="space-y-6 max-w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Board</h1>
          <p className="text-muted-foreground">Aktive Reparaturen via Drag & Drop verschieben.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-muted p-1 rounded-lg flex gap-1">
            <Link href="/repairs" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors flex items-center gap-2">
              <List className="w-4 h-4" /> Liste
            </Link>
            <span className="px-3 py-1.5 text-sm font-medium bg-background shadow-sm text-foreground rounded-md flex items-center gap-2">
              <Kanban className="w-4 h-4" /> Board
            </span>
          </div>
          {session.user.role !== "TECHNICIAN" && (
            <Link 
              href="/repairs/new" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Neue Reparatur
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden mt-4">
        <KanbanBoardClient 
          initialRepairs={JSON.parse(JSON.stringify(repairs))} 
          technicians={technicians}
          currentUser={{ id: session.user.id, role: session.user.role }}
        />
      </div>
    </div>
  );
}
