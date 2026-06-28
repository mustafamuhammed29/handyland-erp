import React from "react";
import { prisma } from "@repo/database";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Search, Filter, MoreHorizontal, Eye } from "lucide-react";
import { RepairsTableClient } from "../../../components/repairs/RepairsTableClient";

export default async function RepairsPage() {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "DIAGNOSING": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "WAITING_FOR_PARTS": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "IN_REPAIR": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "QUALITY_CHECK": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "READY_FOR_PICKUP": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "DELIVERED": return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
      case "CANCELLED": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "NEW": return "Neu";
      case "DIAGNOSING": return "Diagnose";
      case "WAITING_FOR_PARTS": return "Wartet auf Teile";
      case "IN_REPAIR": return "In Reparatur";
      case "QUALITY_CHECK": return "Qualitätskontrolle";
      case "READY_FOR_PICKUP": return "Abholbereit";
      case "DELIVERED": return "Abgeschlossen";
      case "CANCELLED": return "Storniert";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Reparaturen</h1>
          <p className="text-muted-foreground mt-1">Verwalten Sie alle eingehenden Reparaturaufträge.</p>
        </div>
        <button className="bg-accent text-accent-foreground px-4 py-2 rounded-lg font-medium shadow-sm hover:opacity-90 transition-opacity">
          Neue Reparatur
        </button>
      </div>

      <RepairsTableClient initialRepairs={serializedRepairs} />
    </div>
  );
}
