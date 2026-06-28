"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Search, Filter, Eye, Trash2 } from "lucide-react";
import { RepairActionsDropdown } from "./RepairActionsDropdown";
import { deleteRepairs } from "../../app/actions/repair";
import { useRouter } from "next/navigation";

type Repair = any; // We'll use any for now, but it's inferred from Prisma include

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

export function RepairsTableClient({ initialRepairs }: { initialRepairs: Repair[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Filter Logic
  const filteredRepairs = initialRepairs.filter((repair) => {
    const matchesSearch =
      repair.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.device.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.device.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || repair.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRepairs.length && filteredRepairs.length > 0) {
      setSelectedIds(new Set()); // Deselect all
    } else {
      setSelectedIds(new Set(filteredRepairs.map((r) => r.id))); // Select all filtered
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Sind Sie sicher, dass Sie ${selectedIds.size} Reparatur(en) löschen möchten?`)) {
      startTransition(async () => {
        const res = await deleteRepairs(Array.from(selectedIds));
        if (res.success) {
          setSelectedIds(new Set());
          router.refresh();
        } else {
          alert("Fehler beim Löschen: " + res.error);
        }
      });
    }
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
      {/* Table Toolbar */}
      <div className="p-4 border-b flex flex-wrap gap-4 justify-between bg-muted/30">
        <div className="flex gap-2 flex-1 flex-wrap">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ticket, Name oder Gerät suchen..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          
          <select 
            aria-label="Nach Status filtern"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="ALL">Alle Status</option>
            <option value="NEW">Neu</option>
            <option value="DIAGNOSING">Diagnose</option>
            <option value="WAITING_FOR_PARTS">Wartet auf Teile</option>
            <option value="IN_REPAIR">In Reparatur</option>
            <option value="QUALITY_CHECK">Qualitätskontrolle</option>
            <option value="READY_FOR_PICKUP">Abholbereit</option>
            <option value="DELIVERED">Abgeschlossen</option>
            <option value="CANCELLED">Storniert</option>
          </select>
        </div>

        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {isPending ? "Lösche..." : `${selectedIds.size} Löschen`}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-4 w-12">
                <input
                  aria-label="Alle auswählen"
                  type="checkbox"
                  className="rounded border-muted-foreground/30"
                  checked={filteredRepairs.length > 0 && selectedIds.size === filteredRepairs.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-4 font-medium">Ticket-ID</th>
              <th className="px-6 py-4 font-medium">Kunde</th>
              <th className="px-6 py-4 font-medium">Gerät</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Eingang am</th>
              <th className="px-6 py-4 font-medium text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y border-t">
            {filteredRepairs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  Keine Reparaturen gefunden.
                </td>
              </tr>
            ) : (
              filteredRepairs.map((repair) => (
                <tr
                  key={repair.id}
                  className={`hover:bg-muted/30 transition-colors group ${selectedIds.has(repair.id) ? "bg-muted/50" : ""}`}
                >
                  <td className="px-4 py-4 w-12">
                    <input
                      aria-label={`Ticket ${repair.ticketNumber} auswählen`}
                      type="checkbox"
                      className="rounded border-muted-foreground/30"
                      checked={selectedIds.has(repair.id)}
                      onChange={() => toggleSelect(repair.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/repairs/${repair.id}`}
                      className="font-mono font-medium text-foreground hover:text-accent transition-colors"
                    >
                      {repair.ticketNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      {repair.customer.firstName} {repair.customer.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">{repair.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      {repair.device.manufacturer} {repair.device.model}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {repair.issues.length} Problem(e) gemeldet
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        repair.status
                      )}`}
                    >
                      {translateStatus(repair.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {format(new Date(repair.createdAt), "dd. MMM yyyy, HH:mm", { locale: de })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        aria-label="Details ansehen"
                        href={`/repairs/${repair.id}`}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <RepairActionsDropdown repairId={repair.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Dummy */}
      {filteredRepairs.length > 0 && (
        <div className="p-4 border-t flex justify-between items-center text-sm text-muted-foreground bg-muted/10">
          <div>
            Zeigt 1 bis {filteredRepairs.length} von {filteredRepairs.length} Einträgen
          </div>
          <div className="flex gap-1">
            <button
              className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50"
              disabled
            >
              Zurück
            </button>
            <button className="px-3 py-1 border rounded bg-background">1</button>
            <button
              className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50"
              disabled
            >
              Weiter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
