"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Search, Phone, Mail, Calendar, Wrench, Trash2 } from "lucide-react";
import { CustomerActionsDropdown } from "./CustomerActionsDropdown";
import { deleteCustomers } from "../../app/actions/customer";
import { useRouter } from "next/navigation";

type Customer = any; // We'll use any for now, but it's inferred from Prisma include

export function CustomersTableClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Filter Logic
  const filteredCustomers = initialCustomers.filter((customer) => {
    const searchString = searchQuery.toLowerCase();
    return (
      customer.firstName.toLowerCase().includes(searchString) ||
      customer.lastName.toLowerCase().includes(searchString) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchString)) ||
      (customer.email && customer.email.toLowerCase().includes(searchString)) ||
      customer.id.toLowerCase().includes(searchString)
    );
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0) {
      setSelectedIds(new Set()); // Deselect all
    } else {
      setSelectedIds(new Set(filteredCustomers.map((c) => c.id))); // Select all filtered
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
    if (confirm(`Sind Sie sicher, dass Sie ${selectedIds.size} Kunde(n) löschen möchten? Kunden mit Reparaturen werden ignoriert oder blockieren den Vorgang.`)) {
      startTransition(async () => {
        const res = await deleteCustomers(Array.from(selectedIds));
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
    <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
      {/* Table Toolbar */}
      <div className="p-4 border-b flex flex-wrap gap-4 justify-between bg-muted/30">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Name, Telefon, E-Mail suchen..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
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
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
            <tr>
              <th className="px-4 py-4 w-12">
                <input
                  aria-label="Alle auswählen"
                  type="checkbox"
                  className="rounded border-muted-foreground/30"
                  checked={filteredCustomers.length > 0 && selectedIds.size === filteredCustomers.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Kontaktdaten</th>
              <th className="px-6 py-4">Registriert am</th>
              <th className="px-6 py-4 text-center">Reparaturen</th>
              <th className="px-6 py-4 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  Keine Kunden gefunden.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className={`hover:bg-muted/30 transition-colors group ${selectedIds.has(customer.id) ? "bg-muted/50" : ""}`}
                >
                  <td className="px-4 py-4 w-12">
                    <input
                      aria-label={`Kunde ${customer.firstName} auswählen`}
                      type="checkbox"
                      className="rounded border-muted-foreground/30"
                      checked={selectedIds.has(customer.id)}
                      onChange={() => toggleSelect(customer.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {customer.id.substring(customer.id.length - 6).toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 mr-2" />
                      {customer.phone || "-"}
                    </div>
                    {customer.email && (
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 mr-2" />
                        {customer.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 mr-2" />
                      {format(new Date(customer.createdAt), "dd. MMM yyyy", { locale: de })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        <Wrench className="w-3 h-3 mr-1" />
                        {customer._count.repairs}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <CustomerActionsDropdown customerId={customer.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Dummy */}
      {filteredCustomers.length > 0 && (
        <div className="p-4 border-t flex justify-between items-center text-sm text-muted-foreground bg-muted/10">
          <div>
            Zeigt 1 bis {filteredCustomers.length} von {filteredCustomers.length} Einträgen
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
