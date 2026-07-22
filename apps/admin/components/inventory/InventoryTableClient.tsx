"use client";

import React, { useState, useTransition } from "react";
import { Search, Plus, Trash2, Edit, AlertTriangle, Package, PackagePlus, Tag, Smartphone } from "lucide-react";
import { deleteParts, createPart, updatePart, updateStock, createCategory, createDeviceModel } from "../../app/actions/inventory";
import { useRouter } from "next/navigation";
import { getPartTransactions } from "../../app/actions/transactions";
import { StockInModal } from "./StockInModal";

type Part = any;

interface CategoryItem {
  id: string;
  name: string;
}

interface DeviceModelItem {
  id: string;
  brand: string;
  modelName: string;
}

interface SupplierItem {
  id: string;
  name: string;
}

export function InventoryTableClient({
  initialParts,
  categories = [],
  deviceModels = [],
  suppliers = [],
}: {
  initialParts: Part[];
  categories?: CategoryItem[];
  deviceModels?: DeviceModelItem[];
  suppliers?: SupplierItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Stock-In Modal State
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [stockInPartId, setStockInPartId] = useState<string | null>(null);

  // Edit/Add Part Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"edit" | "history">("edit");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Form Data with Category & DeviceModel relations
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    category: "",
    deviceModelId: "",
    brand: "",
    deviceModel: "",
    sku: "",
    quantity: 0,
    minQuantity: 5,
    price: "",
    cost: "",
    location: "",
    supplierId: "",
  });

  // Dynamic lists for inline additions
  const [categoryList, setCategoryList] = useState<CategoryItem[]>(categories);
  const [deviceModelList, setDeviceModelList] = useState<DeviceModelItem[]>(deviceModels);

  const [showInlineCategoryModal, setShowInlineCategoryModal] = useState(false);
  const [newInlineCatName, setNewInlineCatName] = useState("");
  const [isAddingInlineCat, setIsAddingInlineCat] = useState(false);

  const [showInlineModelModal, setShowInlineModelModal] = useState(false);
  const [newInlineBrand, setNewInlineBrand] = useState("Apple");
  const [newInlineModelName, setNewInlineModelName] = useState("");
  const [isAddingInlineModel, setIsAddingInlineModel] = useState(false);

  // Filter Logic
  const filteredParts = initialParts.filter((part) => {
    const searchString = searchQuery.toLowerCase();
    return (
      part.name.toLowerCase().includes(searchString) ||
      (part.sku && part.sku.toLowerCase().includes(searchString)) ||
      (part.category && part.category.toLowerCase().includes(searchString)) ||
      (part.brand && part.brand.toLowerCase().includes(searchString)) ||
      (part.deviceModel && part.deviceModel.toLowerCase().includes(searchString)) ||
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
    setActiveModalTab("edit");
    setTransactions([]);
    setFormData({
      name: "",
      categoryId: "",
      category: "",
      deviceModelId: "",
      brand: "",
      deviceModel: "",
      sku: "",
      quantity: 0,
      minQuantity: 5,
      price: "",
      cost: "",
      location: "",
      supplierId: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (part: Part) => {
    setEditingPart(part);
    setActiveModalTab("edit");
    setFormData({
      name: part.name,
      categoryId: part.categoryId || "",
      category: part.category || "",
      deviceModelId: part.deviceModelId || "",
      brand: part.brand || "",
      deviceModel: part.deviceModel || "",
      sku: part.sku || "",
      quantity: part.quantity,
      minQuantity: part.minQuantity,
      price: part.price.toString(),
      cost: part.cost?.toString() || "",
      location: part.location || "",
      supplierId: part.supplierId || "",
    });
    setIsModalOpen(true);

    setIsLoadingTransactions(true);
    const res = await getPartTransactions(part.id);
    if (res.success && res.transactions) {
      setTransactions(res.transactions);
    }
    setIsLoadingTransactions(false);
  };

  const handleAddCategoryInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInlineCatName.trim()) return;
    setIsAddingInlineCat(true);
    const res = await createCategory(newInlineCatName.trim());
    setIsAddingInlineCat(false);

    if (res.success && res.category) {
      const created = { id: res.category.id, name: res.category.name };
      setCategoryList((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, categoryId: created.id, category: created.name }));
      setNewInlineCatName("");
      setShowInlineCategoryModal(false);
    } else {
      alert("Fehler: " + (res.error || "Kategorie konnte nicht erstellt werden."));
    }
  };

  const handleAddModelInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInlineBrand.trim() || !newInlineModelName.trim()) return;
    setIsAddingInlineModel(true);
    const res = await createDeviceModel(newInlineBrand.trim(), newInlineModelName.trim());
    setIsAddingInlineModel(false);

    if (res.success && res.deviceModel) {
      const created = {
        id: res.deviceModel.id,
        brand: res.deviceModel.brand,
        modelName: res.deviceModel.modelName,
      };
      setDeviceModelList((prev) => [...prev, created]);
      setFormData((prev) => ({
        ...prev,
        deviceModelId: created.id,
        brand: created.brand,
        deviceModel: created.modelName,
      }));
      setNewInlineModelName("");
      setShowInlineModelModal(false);
    } else {
      alert("Fehler: " + (res.error || "Modell konnte nicht erstellt werden."));
    }
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
            placeholder="Teil, SKU, Modell oder Kategorie suchen..."
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

          {/* Wareneingang Stock-In Action Button */}
          <button
            onClick={() => {
              setStockInPartId(null);
              setIsStockInOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground border border-accent/30 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <PackagePlus className="h-4 w-4" />
            + Wareneingang
          </button>

          {/* Add Part Button */}
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
                <th className="px-6 py-4">Kategorie & Modell</th>
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
                      className={`hover:bg-muted/30 transition-colors ${selectedIds.has(part.id) ? "bg-muted/50" : ""} ${
                        isLowStock ? "bg-red-50/50 dark:bg-red-950/10" : ""
                      }`}
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
                        <div className="text-xs text-muted-foreground mt-1">SKU: {part.sku || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="w-fit px-2 py-0.5 rounded-full bg-muted border text-xs font-medium text-muted-foreground">
                            {part.category || "Allgemein"}
                          </span>
                          {(part.brand || part.deviceModel) && (
                            <span className="text-[11px] text-muted-foreground font-medium">
                              {part.brand} {part.deviceModel}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            disabled={isPending}
                            onClick={() => handleQuickStockChange(part.id, -1)}
                            className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 text-muted-foreground"
                          >
                            -
                          </button>
                          <span className={`font-mono font-bold text-base ${isLowStock ? "text-red-500" : ""}`}>
                            {part.quantity}
                          </span>
                          <button
                            disabled={isPending}
                            onClick={() => handleQuickStockChange(part.id, 1)}
                            className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 text-muted-foreground"
                          >
                            +
                          </button>
                        </div>
                        {isLowStock && (
                          <div className="flex items-center justify-center gap-1 text-[10px] text-red-500 mt-1 uppercase font-bold tracking-wider">
                            <AlertTriangle className="w-3 h-3" /> Nachbestellen
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{Number(part.price).toFixed(2)} €</td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">{part.location || "-"}</td>
                      <td className="px-6 py-4 text-right space-x-1">
                        {/* Quick Stock-In Button */}
                        <button
                          onClick={() => {
                            setStockInPartId(part.id);
                            setIsStockInOpen(true);
                          }}
                          title="Wareneingang buchen"
                          className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        >
                          <PackagePlus className="w-4 h-4" />
                        </button>

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

      {/* Reusable Stock-In Modal */}
      <StockInModal
        isOpen={isStockInOpen}
        onClose={() => {
          setIsStockInOpen(false);
          setStockInPartId(null);
        }}
        preselectedPartId={stockInPartId}
        parts={initialParts}
        suppliers={suppliers}
        categories={categoryList}
        deviceModels={deviceModelList}
      />

      {/* Add/Edit Part Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-xl border p-6 m-4 max-h-[90vh] overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold mb-4">{editingPart ? "Teil bearbeiten" : "Neues Teil hinzufügen"}</h2>

            {editingPart && (
              <div className="flex gap-4 border-b mb-4">
                <button
                  onClick={() => setActiveModalTab("edit")}
                  className={`pb-2 font-medium text-sm transition-colors ${
                    activeModalTab === "edit" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveModalTab("history")}
                  className={`pb-2 font-medium text-sm transition-colors ${
                    activeModalTab === "history" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Historie
                </button>
              </div>
            )}

            <div className="overflow-y-auto flex-1 pb-4 pr-1">
              {activeModalTab === "edit" || !editingPart ? (
                <form id="partForm" onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="z.B. iPhone 13 Display Original"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Category Dropdown + Inline Quick Add */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label htmlFor="category" className="text-sm font-medium">
                          Kategorie
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowInlineCategoryModal(true)}
                          className="text-xs text-accent hover:underline flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> Neu
                        </button>
                      </div>
                      <select
                        id="categoryId"
                        value={formData.categoryId}
                        onChange={(e) => {
                          const catId = e.target.value;
                          const foundCat = categoryList.find((c) => c.id === catId);
                          setFormData({
                            ...formData,
                            categoryId: catId,
                            category: foundCat ? foundCat.name : "",
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-sm"
                      >
                        <option value="">-- Keine / Allgemein --</option>
                        {categoryList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Device Model Dropdown + Inline Quick Add */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label htmlFor="deviceModel" className="text-sm font-medium">
                          Gerätemodell
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowInlineModelModal(true)}
                          className="text-xs text-accent hover:underline flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> Neu
                        </button>
                      </div>
                      <select
                        id="deviceModelId"
                        value={formData.deviceModelId}
                        onChange={(e) => {
                          const modelId = e.target.value;
                          const foundModel = deviceModelList.find((m) => m.id === modelId);
                          setFormData({
                            ...formData,
                            deviceModelId: modelId,
                            brand: foundModel ? foundModel.brand : "",
                            deviceModel: foundModel ? foundModel.modelName : "",
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-sm"
                      >
                        <option value="">-- Keines / Universell --</option>
                        {deviceModelList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.brand} {m.modelName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="sku" className="text-sm font-medium">
                        SKU / Artikelnummer
                      </label>
                      <input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="supplier" className="text-sm font-medium">
                        Lieferant
                      </label>
                      <select
                        id="supplierId"
                        value={formData.supplierId}
                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-sm"
                      >
                        <option value="">-- Keiner / Unbekannt --</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="quantity" className="text-sm font-medium">
                        Aktueller Bestand
                      </label>
                      <input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="minQuantity" className="text-sm font-medium">
                        Mindestbestand
                      </label>
                      <input
                        id="minQuantity"
                        type="number"
                        value={formData.minQuantity}
                        onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="price" className="text-sm font-medium">
                        Verkaufspreis (€) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="price"
                        required
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="cost" className="text-sm font-medium">
                        Einkaufspreis (€)
                      </label>
                      <input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Lagerort (Regal/Fach)
                    </label>
                    <input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="z.B. Regal A, Fach 3"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                    />
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {isLoadingTransactions ? (
                    <p className="text-sm text-muted-foreground">Lade Historie...</p>
                  ) : transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Keine Transaktionen gefunden.</p>
                  ) : (
                    <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-3 py-2 font-medium">Datum</th>
                          <th className="px-3 py-2 font-medium">Typ</th>
                          <th className="px-3 py-2 font-medium text-right">Menge</th>
                          <th className="px-3 py-2 font-medium">Benutzer</th>
                          <th className="px-3 py-2 font-medium">Referenz / Notiz</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {transactions.map((t) => (
                          <tr key={t.id} className="hover:bg-muted/30">
                            <td className="px-3 py-2 text-muted-foreground">
                              {new Date(t.createdAt).toLocaleDateString("de-DE")}{" "}
                              {new Date(t.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="px-3 py-2 font-semibold text-xs">{t.type}</td>
                            <td className={`px-3 py-2 text-right font-medium ${t.quantityChange > 0 ? "text-green-600" : "text-red-600"}`}>
                              {t.quantityChange > 0 ? "+" : ""}
                              {t.quantityChange}
                            </td>
                            <td className="px-3 py-2">{t.staffName}</td>
                            <td className="px-3 py-2 text-muted-foreground text-xs">
                              {t.reference && <span className="font-semibold block">{t.reference}</span>}
                              {t.notes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {activeModalTab === "edit" && (
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors font-medium text-sm"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  form="partForm"
                  disabled={isPending}
                  className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium text-sm disabled:opacity-50"
                >
                  {isPending ? "Speichern..." : "Speichern"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Category Mini Modal inside Part form */}
      {showInlineCategoryModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleAddCategoryInline} className="bg-card w-full max-w-sm rounded-xl p-5 border shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Tag className="w-4 h-4 text-accent" />
              <h3 className="font-bold text-sm">Neue Kategorie erstellen</h3>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Kategoriename</label>
              <input
                type="text"
                autoFocus
                required
                value={newInlineCatName}
                onChange={(e) => setNewInlineCatName(e.target.value)}
                placeholder="z.B. Display, Akku..."
                className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowInlineCategoryModal(false)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isAddingInlineCat}
                className="px-4 py-1.5 bg-foreground text-background rounded-lg text-xs font-semibold"
              >
                {isAddingInlineCat ? "Erstelle..." : "Erstellen & Auswählen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Add Device Model Mini Modal inside Part form */}
      {showInlineModelModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleAddModelInline} className="bg-card w-full max-w-sm rounded-xl p-5 border shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Smartphone className="w-4 h-4 text-accent" />
              <h3 className="font-bold text-sm">Neues Gerätemodell erstellen</h3>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Marke</label>
              <input
                type="text"
                required
                value={newInlineBrand}
                onChange={(e) => setNewInlineBrand(e.target.value)}
                placeholder="Apple, Samsung..."
                className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Modellname</label>
              <input
                type="text"
                autoFocus
                required
                value={newInlineModelName}
                onChange={(e) => setNewInlineModelName(e.target.value)}
                placeholder="z.B. iPhone 16 Pro"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowInlineModelModal(false)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isAddingInlineModel}
                className="px-4 py-1.5 bg-foreground text-background rounded-lg text-xs font-semibold"
              >
                {isAddingInlineModel ? "Erstelle..." : "Erstellen & Auswählen"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
