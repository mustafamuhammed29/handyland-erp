"use client";

import React, { useState, useTransition } from "react";
import { Search, Plus, Trash2, Edit, AlertTriangle, Package } from "lucide-react";
import { deleteParts, createPart, updatePart, updateStock } from "../../app/actions/inventory";
import { useRouter } from "next/navigation";

type Part = any; // Serialized part

export function InventoryTableClient({ initialParts }: { initialParts: Part[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState({
    name: "", category: "", sku: "", quantity: 0, minQuantity: 5, price: "", cost: "", location: ""
  });

  // Filter Logic
  const filteredParts = initialParts.filter((part) => {
    const searchString = searchQuery.toLowerCase();
    return (
      part.name.toLowerCase().includes(searchString) ||
      (part.sku && part.sku.toLowerCase().includes(searchString)) ||
      (part.category && part.category.toLowerCase().includes(searchString)) ||
      (part.location && part.location.toLowerCase().includes(searchString))
    );
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredParts.length && filteredParts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredParts.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Sind Sie sicher, dass Sie ${selectedIds.size} Teil(e) löschen möchten?`)) {
      startTransition(async () => {
        const res = await deleteParts(Array.from(selectedIds));
        if (res.success) {
          setSelectedIds(new Set());
          router.refresh();
        } else {
          alert("Fehler beim Löschen: " + res.error);
        }
      });
    }
  };

  const handleQuickStockChange = (id: string, amount: number) => {
    startTransition(async () => {
      await updateStock(id, amount);
      router.refresh();
    });
  };

  const openAddModal = () => {
    setEditingPart(null);
    setFormData({ name: "", category: "", sku: "", quantity: 0, minQuantity: 5, price: "", cost: "", location: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (part: Part) => {
    setEditingPart(part);
    setFormData({
      name: part.name, category: part.category || "", sku: part.sku || "", 
      quantity: part.quantity, minQuantity: part.minQuantity, 
      price: part.price.toString(), cost: part.cost?.toString() || "", location: part.location || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      let res;
      if (editingPart) {
        res = await updatePart(editingPart.id, formData);
      } else {
        res = await createPart(formData);
      }
      
      if (res.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Fehler beim Speichern: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card p-4 rounded-lg shadow-sm border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Teil, SKU oder Kategorie suchen..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
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
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Neues Teil
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-4 py-4 w-12">
                  <input
                    aria-label="Alle auswählen"
                    type="checkbox"
                    className="rounded border-muted-foreground/30"
                    checked={filteredParts.length > 0 && selectedIds.size === filteredParts.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4">Teil / SKU</th>
                <th className="px-6 py-4">Kategorie</th>
                <th className="px-6 py-4 text-center">Bestand</th>
                <th className="px-6 py-4">Preis</th>
                <th className="px-6 py-4">Lagerort</th>
                <th className="px-6 py-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Keine Teile gefunden.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isLowStock = part.quantity <= part.minQuantity;
                  return (
                    <tr
                      key={part.id}
                      className={`hover:bg-muted/30 transition-colors ${selectedIds.has(part.id) ? "bg-muted/50" : ""} ${isLowStock ? "bg-red-50/50 dark:bg-red-950/10" : ""}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          aria-label={`${part.name} auswählen`}
                          type="checkbox"
                          className="rounded border-muted-foreground/30"
                          checked={selectedIds.has(part.id)}
                          onChange={() => toggleSelect(part.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          {part.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          SKU: {part.sku || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-muted border text-xs font-medium text-muted-foreground">
                          {part.category || "Allgemein"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            disabled={isPending}
                            onClick={() => handleQuickStockChange(part.id, -1)}
                            className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 text-muted-foreground"
                          >-</button>
                          <span className={`font-mono font-bold text-base ${isLowStock ? "text-red-500" : ""}`}>
                            {part.quantity}
                          </span>
                          <button 
                            disabled={isPending}
                            onClick={() => handleQuickStockChange(part.id, 1)}
                            className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 text-muted-foreground"
                          >+</button>
                        </div>
                        {isLowStock && (
                          <div className="flex items-center justify-center gap-1 text-[10px] text-red-500 mt-1 uppercase font-bold tracking-wider">
                            <AlertTriangle className="w-3 h-3" /> Nachbestellen
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {Number(part.price).toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {part.location || "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(part)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          aria-label="Bearbeiten"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-xl border p-6 m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingPart ? "Teil bearbeiten" : "Neues Teil hinzufügen"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                <input
                  id="name"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="sku" className="text-sm font-medium">SKU / Artikelnummer</label>
                  <input
                    id="sku"
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Kategorie</label>
                  <input
                    id="category"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    placeholder="z.B. Display, Akku"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-sm font-medium">Aktueller Bestand</label>
                  <input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="minQuantity" className="text-sm font-medium">Mindestbestand</label>
                  <input
                    id="minQuantity"
                    type="number"
                    value={formData.minQuantity}
                    onChange={e => setFormData({...formData, minQuantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">Verkaufspreis (€) <span className="text-red-500">*</span></label>
                  <input
                    id="price"
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="cost" className="text-sm font-medium">Einkaufspreis (€)</label>
                  <input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={e => setFormData({...formData, cost: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">Lagerort (Regal/Fach)</label>
                <input
                  id="location"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="z.B. Regal A, Fach 3"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                >
                  {isPending ? "Speichern..." : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
