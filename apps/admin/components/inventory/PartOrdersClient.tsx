"use client";

import React, { useState, useTransition, useMemo } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Search, Plus, Trash2, Phone, Clock, CheckCircle2,
  Package, Truck, Bell, XCircle, ChevronDown, Filter
} from "lucide-react";
import { createPartOrder, updatePartOrderStatus, deletePartOrders } from "../../app/actions/partOrder";
import { useRouter } from "next/navigation";

type Customer = { id: string; firstName: string; lastName: string; phone: string; email: string | null };
type PartOrder = {
  id: string; createdAt: string; updatedAt: string;
  customerId: string; customer: Customer;
  partName: string; description: string | null; notes: string | null;
  status: string; orderedAt: string | null; arrivedAt: string | null;
  estimatedPrice: string | null;
};

// ──────────────────────────────────────────────
//  Status Config
// ──────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType; nextStatus?: string; nextLabel?: string }> = {
  PENDING:   { label: "Ausstehend",   color: "text-yellow-600", bg: "bg-yellow-500/10 border-yellow-500/20",  icon: Clock,        nextStatus: "ORDERED",   nextLabel: "Als bestellt markieren" },
  ORDERED:   { label: "Bestellt",     color: "text-blue-500",   bg: "bg-blue-500/10 border-blue-500/20",      icon: Truck,        nextStatus: "ARRIVED",   nextLabel: "Als angekommen markieren" },
  ARRIVED:   { label: "Eingetroffen", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20",  icon: Package,      nextStatus: "NOTIFIED",  nextLabel: "Kunde benachrichtigt" },
  NOTIFIED:  { label: "Benachricht.", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20",  icon: Bell,         nextStatus: "COMPLETED", nextLabel: "Als erledigt markieren" },
  COMPLETED: { label: "Erledigt",     color: "text-green-500",  bg: "bg-green-500/10 border-green-500/20",    icon: CheckCircle2, nextStatus: undefined,   nextLabel: undefined },
  CANCELLED: { label: "Storniert",    color: "text-red-500",    bg: "bg-red-500/10 border-red-500/20",        icon: XCircle,      nextStatus: undefined,   nextLabel: undefined },
};

const FILTER_OPTIONS = [
  { value: "ALL",       label: "Alle" },
  { value: "PENDING",   label: "Ausstehend" },
  { value: "ORDERED",   label: "Bestellt" },
  { value: "ARRIVED",   label: "Eingetroffen" },
  { value: "NOTIFIED",  label: "Benachrichtigt" },
  { value: "COMPLETED", label: "Erledigt" },
  { value: "CANCELLED", label: "Storniert" },
];

// ──────────────────────────────────────────────
//  Status Badge
// ──────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["PENDING"]!;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ──────────────────────────────────────────────
//  Status Dropdown
// ──────────────────────────────────────────────
function StatusDropdown({ order, onUpdate }: { order: PartOrder; onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = (status: string) => {
    setOpen(false);
    startTransition(async () => {
      await updatePartOrderStatus(order.id, status as any);
      onUpdate();
    });
  };

  return (
    <div className="relative">
      <button
        disabled={isPending}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded-lg px-2 py-1 hover:bg-muted transition-colors"
      >
        Status ändern <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-card border rounded-lg shadow-xl z-50 overflow-hidden">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => handleChange(key)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left ${key === order.status ? "bg-muted/50 font-semibold" : ""}`}
            >
              <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
              {cfg.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
//  Add Order Modal
// ──────────────────────────────────────────────
function AddOrderModal({ customers, onClose, onSaved }: {
  customers: Customer[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ partName: "", description: "", estimatedPrice: "", notes: "" });
  const [isPending, startTransition] = useTransition();
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers.slice(0, 8);
    const q = customerSearch.toLowerCase();
    return customers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [customerSearch, customers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return alert("Bitte wählen Sie einen Kunden aus.");
    startTransition(async () => {
      const res = await createPartOrder({ customerId: selectedCustomer.id, ...formData });
      if (res.success) {
        onSaved();
        onClose();
      } else {
        alert("Fehler: " + res.error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-muted/30">
          <h2 className="text-lg font-bold">Neue Teilbestellung</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Kunden auswählen und benötigtes Teil eintragen</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Search */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Kunde <span className="text-red-500">*</span></label>
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div>
                  <div className="font-semibold text-sm">{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Phone className="w-3 h-3" /> {selectedCustomer.phone}
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedCustomer(null)} className="text-xs text-muted-foreground hover:text-red-500 underline">
                  Ändern
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={e => { setCustomerSearch(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Name oder Telefon suchen..."
                  className="w-full pl-9 pr-4 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {showDropdown && filteredCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-xl shadow-xl z-10 overflow-hidden max-h-48 overflow-y-auto">
                    {filteredCustomers.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelectedCustomer(c); setCustomerSearch(""); setShowDropdown(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors text-left"
                      >
                        <div>
                          <div className="text-sm font-medium">{c.firstName} {c.lastName}</div>
                          <div className="text-xs text-muted-foreground">{c.phone}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Part Name */}
          <div className="space-y-2">
            <label htmlFor="partName" className="text-sm font-semibold">Benötigtes Teil <span className="text-red-500">*</span></label>
            <input
              id="partName"
              required
              value={formData.partName}
              onChange={e => setFormData(f => ({ ...f, partName: e.target.value }))}
              placeholder="z.B. iPhone 13 Display Original, Samsung S23 Akku"
              className="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="desc" className="text-sm font-semibold">Zusätzliche Details</label>
            <input
              id="desc"
              value={formData.description}
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="z.B. Farbe: Schwarz, Qualität: OEM"
              className="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-semibold">Geschätzter Preis (€)</label>
              <input
                id="price"
                type="number"
                step="0.01"
                value={formData.estimatedPrice}
                onChange={e => setFormData(f => ({ ...f, estimatedPrice: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-semibold">Notizen</label>
              <input
                id="notes"
                value={formData.notes}
                onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                placeholder="Interne Notizen..."
                className="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl hover:bg-muted transition-colors font-medium text-sm">
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm disabled:opacity-50"
            >
              {isPending ? "Speichern..." : "Bestellung erstellen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
//  Main Component
// ──────────────────────────────────────────────
export function PartOrdersClient({ initialOrders, customers }: {
  initialOrders: PartOrder[];
  customers: Customer[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refresh = () => router.refresh();

  const filtered = useMemo(() => {
    return initialOrders.filter(o => {
      const matchSearch =
        o.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.phone.includes(searchQuery);
      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [initialOrders, searchQuery, statusFilter]);

  const toggleAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(o => o.id)));
  };
  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    if (!selectedIds.size) return;
    if (!confirm(`${selectedIds.size} Bestellung(en) löschen?`)) return;
    startTransition(async () => {
      await deletePartOrders(Array.from(selectedIds));
      setSelectedIds(new Set());
      refresh();
    });
  };

  // Count by status
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    initialOrders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return map;
  }, [initialOrders]);

  return (
    <div className="space-y-5">
      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? "ALL" : key)}
              className={`rounded-xl border p-3 text-left transition-all hover:shadow-md ${
                statusFilter === key ? `${cfg.bg} ${cfg.color}` : "bg-card"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${statusFilter === key ? cfg.color : "text-muted-foreground"}`} />
              <div className={`text-xl font-bold ${statusFilter === key ? cfg.color : ""}`}>{counts[key] || 0}</div>
              <div className="text-xs text-muted-foreground leading-tight">{cfg.label}</div>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Kunde oder Teil suchen..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          {/* Status filter select */}
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <select
              aria-label="Status filtern"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer"
            >
              {FILTER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {selectedIds.size} Löschen
            </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Neue Bestellung
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    aria-label="Alle auswählen"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleAll}
                    className="rounded border-muted-foreground/30"
                  />
                </th>
                <th className="px-4 py-3">Kunde</th>
                <th className="px-4 py-3">Benötigtes Teil</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Datum</th>
                <th className="px-4 py-3">Preis</th>
                <th className="px-4 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">Keine Bestellungen gefunden</p>
                    <p className="text-xs text-muted-foreground mt-1">Erstellen Sie eine neue Bestellung über den Button oben</p>
                  </td>
                </tr>
              ) : (
                filtered.map(order => {
                  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["PENDING"]!;
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-muted/20 transition-colors group ${
                        selectedIds.has(order.id) ? "bg-muted/40" : ""
                      } ${order.status === "ARRIVED" ? "bg-purple-500/5" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label="Auswählen"
                          checked={selectedIds.has(order.id)}
                          onChange={() => toggle(order.id)}
                          className="rounded border-muted-foreground/30"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-0.5 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          {order.customer.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-foreground">{order.partName}</div>
                        {order.description && (
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">{order.description}</div>
                        )}
                        {order.notes && (
                          <div className="text-xs italic text-muted-foreground/70 mt-0.5 truncate">📝 {order.notes}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                        {/* Sub-dates */}
                        {order.orderedAt && (
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Bestellt: {format(new Date(order.orderedAt), "dd.MM", { locale: de })}
                          </div>
                        )}
                        {order.arrivedAt && (
                          <div className="text-xs text-purple-500 mt-0.5 flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            Angekommen: {format(new Date(order.arrivedAt), "dd.MM", { locale: de })}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        <div>{format(new Date(order.createdAt), "dd. MMM yyyy", { locale: de })}</div>
                        <div className="text-muted-foreground/60 mt-0.5">{format(new Date(order.createdAt), "HH:mm")}</div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {order.estimatedPrice ? `${Number(order.estimatedPrice).toFixed(2)} €` : <span className="text-muted-foreground text-xs">-</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <StatusDropdown order={order} onUpdate={refresh} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t text-xs text-muted-foreground bg-muted/10 flex justify-between">
            <span>{filtered.length} Bestellung{filtered.length !== 1 ? "en" : ""}</span>
            <span>{selectedIds.size > 0 ? `${selectedIds.size} ausgewählt` : ""}</span>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AddOrderModal
          customers={customers}
          onClose={() => setIsModalOpen(false)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
