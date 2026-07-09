import React from "react";
import { prisma } from "@repo/database";
import Link from "next/link";
import { List, Kanban, Plus } from "lucide-react";
import { RepairsTableClient } from "../../../components/repairs/RepairsTableClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export default async function RepairsPage() {
  const session = await getServerSession(authOptions);

  const repairs = await prisma.repair.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      device: true,
      issues: true,
    },
  });

  const serializedRepairs = repairs.map((repair) => ({
    ...repair,
    estimatedPrice: repair.estimatedPrice ? repair.estimatedPrice.toString() : null,
    finalPrice: repair.finalPrice ? repair.finalPrice.toString() : null,
    customer: {
      ...repair.customer,
      totalSpending: repair.customer.totalSpending ? repair.customer.totalSpending.toString() : null,
    },
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reparaturen</h1>
          <p className="text-muted-foreground">Alle Reparaturaufträge im Überblick.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-muted p-1 rounded-lg flex gap-1">
            <span className="px-3 py-1.5 text-sm font-medium bg-background shadow-sm text-foreground rounded-md flex items-center gap-2">
              <List className="w-4 h-4" /> Liste
            </span>
            <Link href="/repairs/board" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors flex items-center gap-2">
              <Kanban className="w-4 h-4" /> Board
            </Link>
          </div>
          {session?.user?.role !== "TECHNICIAN" && (
            <Link 
              href="/repairs/new" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Neue Reparatur
            </Link>
          )}
        </div>
      </div>

      <RepairsTableClient initialRepairs={serializedRepairs} />
    </div>
  );
}
