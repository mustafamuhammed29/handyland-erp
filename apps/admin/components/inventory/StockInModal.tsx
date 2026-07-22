"use client";

import React, { useState, useEffect, useTransition } from "react";
import { X, PackagePlus, Plus, Building2, Tag, Smartphone, Layers } from "lucide-react";
import { addStockIn, createCategory, createDeviceModel } from "../../app/actions/inventory";
import { useRouter } from "next/navigation";
import { QuickAddBrandModal } from "./QuickAddBrandModal";

interface PartItem {
  id: string;
  name: string;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  deviceModel?: string | null;
  quantity: number;
  cost?: string | null;
}

interface SupplierItem {
  id: string;
  name: string;
}

interface BrandItem {
  id: string;
  name: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

interface DeviceModelItem {
  id: string;
  brand: string;
  brandId?: string | null;
  modelName: string;
}

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPartId?: string | null;
  parts: PartItem[];
  suppliers: SupplierItem[];
  brands?: BrandItem[];
  categories: CategoryItem[];
  deviceModels: DeviceModelItem[];
  onSuccess?: () => void;
}

export function StockInModal({
  isOpen,
  onClose,
  preselectedPartId,
  parts,
  suppliers,
  brands = [],
  categories,
  deviceModels,
  onSuccess,
}: StockInModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Mode: "existing" | "new"
  const [mode, setMode] = useState<"existing" | "new">("existing");

  // Selection & Form states
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [supplierName, setSupplierName] = useState<string>("");
  const [isCustomSupplier, setIsCustomSupplier] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");

  // New Part Data
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [newPart, setNewPart] = useState({
    name: "",
    categoryId: "",
    deviceModelId: "",
    sku: "",
    minQuantity: 5,
    price: "",
    cost: "",
    location: "",
  });

  // Inline Quick Add States
  const [brandList, setBrandList] = useState<BrandItem[]>(brands);
  const [categoryList, setCategoryList] = useState<CategoryItem[]>(categories);
  const [deviceModelList, setDeviceModelList] = useState<DeviceModelItem[]>(deviceModels);

  const [showQuickBrandModal, setShowQuickBrandModal] = useState(false);

  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [showQuickModelModal, setShowQuickModelModal] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [isAddingModel, setIsAddingModel] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBrandList(brands);
  }, [brands]);

  useEffect(() => {
    setCategoryList(categories);
  }, [categories]);

  useEffect(() => {
    setDeviceModelList(deviceModels);
  }, [deviceModels]);

  useEffect(() => {
    if (preselectedPartId) {
      setMode("existing");
      setSelectedPartId(preselectedPartId);
      const matchedPart = parts.find((p) => p.id === preselectedPartId);
      if (matchedPart && matchedPart.cost) {
        setUnitCost(matchedPart.cost.toString());
      }
    } else if (parts.length > 0 && parts[0] && !selectedPartId) {
      setSelectedPartId(parts[0].id);
    }
  }, [preselectedPartId, parts]);

  if (!isOpen) return null;

  const currentPart = parts.find((p) => p.id === selectedPartId);

  // Cascading Device Models based on selected brand
  const availableModelsForModal = !selectedBrandId
    ? deviceModelList
    : deviceModelList.filter((m) => {
        const bObj = brandList.find((b) => b.id === selectedBrandId);
        return m.brandId === selectedBrandId || (bObj && m.brand.toLowerCase() === bObj.name.toLowerCase());
      });

  const handlePartChange = (id: string) => {
    setSelectedPartId(id);
    const p = parts.find((item) => item.id === id);
    if (p && p.cost) {
      setUnitCost(p.cost.toString());
    } else {
      setUnitCost("");
    }
  };

  const handleAddCategoryInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsAddingCategory(true);
    const res = await createCategory(newCategoryName.trim());
    setIsAddingCategory(false);

    if (res.success && res.category) {
      const created = { id: res.category.id, name: res.category.name };
      setCategoryList((prev) => [...prev, created]);
      setNewPart((prev) => ({ ...prev, categoryId: created.id }));
      setNewCategoryName("");
      setShowQuickCategoryModal(false);
    } else {
      alert("Fehler: " + (res.error || "Kategorie konnte nicht erstellt werden."));
    }
  };

  const handleAddModelInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId || !newModelName.trim()) return;

    const bObj = brandList.find((b) => b.id === selectedBrandId);
    const brandName = bObj ? bObj.name : "";

    setIsAddingModel(true);
    const res = await createDeviceModel(brandName, newModelName.trim(), selectedBrandId);
    setIsAddingModel(false);

    if (res.success && res.deviceModel) {
      const created = {
        id: res.deviceModel.id,
        brand: res.deviceModel.brand,
        brandId: res.deviceModel.brandId || selectedBrandId,
        modelName: res.deviceModel.modelName,
      };
      setDeviceModelList((prev) => [...prev, created]);
      setNewPart((prev) => ({ ...prev, deviceModelId: created.id }));
      setNewModelName("");
      setShowQuickModelModal(false);
    } else {
      alert("Fehler: " + (res.error || "Modell konnte nicht erstellt werden."));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (quantity <= 0) {
      setError("Menge muss mindestens 1 sein.");
      return;
    }

    if (mode === "existing" && !selectedPartId) {
      setError("Bitte wählen Sie ein Teil aus.");
      return;
    }

    if (mode === "new" && (!newPart.name.trim() || !newPart.price)) {
      setError("Name und Verkaufspreis sind erforderlich.");
      return;
    }

    startTransition(async () => {
      const payload: any = {
        quantity: Number(quantity),
        unitCost: unitCost ? String(unitCost) : undefined,
        supplierId: !isCustomSupplier && supplierId ? supplierId : undefined,
        supplierName: isCustomSupplier && supplierName.trim() ? supplierName.trim() : undefined,
        notes: notes.trim() || undefined,
      };

      if (mode === "existing") {
        payload.partId = selectedPartId;
      } else {
        payload.newPartData = {
          name: newPart.name.trim(),
          categoryId: newPart.categoryId || undefined,
          deviceModelId: newPart.deviceModelId || undefined,
          sku: newPart.sku.trim() || undefined,
          minQuantity: Number(newPart.minQuantity) || 5,
          price: String(newPart.price),
          cost: unitCost ? String(unitCost) : newPart.cost ? String(newPart.cost) : undefined,
          location: newPart.location.trim() || undefined,
        };
      }

      const res = await addStockIn(payload);
      if (res.success) {
        router.refresh();
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError((res as any).error || "Fehler beim Buchen des Wareneingangs.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-xl rounded-xl shadow-2xl border p-6 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-foreground text-background rounded-lg">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Wareneingang buchen</h2>
              <p className="text-xs text-muted-foreground">Neuen Bestand einbuchen (Transaktion: PURCHASE)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-muted p-1 rounded-lg mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={`flex-1 py-2 rounded-md transition-all ${
              mode === "existing" ? "bg-card shadow text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Existierendes Teil aufstocken
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={`flex-1 py-2 rounded-md transition-all ${
              mode === "new" ? "bg-card shadow text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            + Neues Teil anlegen & einbuchen
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 rounded-lg p-3 text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {mode === "existing" ? (
            <div className="space-y-3">
              <label className="text-sm font-medium block">
                Teil auswählen <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPartId}
                onChange={(e) => handlePartChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-accent"
              >
                {parts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.sku ? `(SKU: ${p.sku})` : ""} — Aktuell: {p.quantity} Stk.
                  </option>
                ))}
              </select>

              {currentPart && (
                <div className="bg-muted/40 p-3 rounded-lg border text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold block">{currentPart.name}</span>
                    <span className="text-muted-foreground">
                      Kategorie: {currentPart.category || "Allgemein"} | Modell: {currentPart.brand || ""} {currentPart.deviceModel || ""}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block">Aktueller Bestand</span>
                    <span className="text-base font-bold font-mono">{currentPart.quantity} Stk.</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 border-b pb-4">
              <div>
                <label className="text-sm font-medium block">Bezeichnung / Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  placeholder="z.B. iPhone 13 Display Original Schwarz"
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Brand Dropdown + Quick Add */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium">Marke</label>
                    <button
                      type="button"
                      onClick={() => setShowQuickBrandModal(true)}
                      className="text-[11px] text-accent hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Neu
                    </button>
                  </div>
                  <select
                    value={selectedBrandId}
                    onChange={(e) => {
                      setSelectedBrandId(e.target.value);
                      setNewPart({ ...newPart, deviceModelId: "" });
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  >
                    <option value="">-- Keine Marke --</option>
                    {brandList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Device Model Dropdown + Quick Add */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium">Gerätemodell</label>
                    <button
                      type="button"
                      disabled={!selectedBrandId}
                      onClick={() => setShowQuickModelModal(true)}
                      className="text-[11px] text-accent hover:underline flex items-center gap-0.5 disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" /> Neu
                    </button>
                  </div>
                  <select
                    value={newPart.deviceModelId}
                    onChange={(e) => setNewPart({ ...newPart, deviceModelId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  >
                    <option value="">-- Keines / Universell --</option>
                    {availableModelsForModal.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.modelName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Dropdown + Quick Add */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium">Kategorie</label>
                    <button
                      type="button"
                      onClick={() => setShowQuickCategoryModal(true)}
                      className="text-[11px] text-accent hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Neu
                    </button>
                  </div>
                  <select
                    value={newPart.categoryId}
                    onChange={(e) => setNewPart({ ...newPart, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  >
                    <option value="">-- Keine / Allgemein --</option>
                    {categoryList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium block">Verkaufspreis (€) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPart.price}
                    onChange={(e) => setNewPart({ ...newPart, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block">SKU / Artikelnummer</label>
                  <input
                    type="text"
                    value={newPart.sku}
                    onChange={(e) => setNewPart({ ...newPart, sku: e.target.value })}
                    placeholder="z.B. DISP-IP13-BLK"
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quantity & Purchasing Details */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-sm font-medium block">
                Gelieferte Menge Stk. <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg bg-background font-mono font-bold text-base focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="text-sm font-medium block">Einkaufspreis / Stk. (€)</label>
              <input
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Supplier Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-muted-foreground" /> Lieferant
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomSupplier(!isCustomSupplier);
                  setSupplierId("");
                  setSupplierName("");
                }}
                className="text-xs text-accent hover:underline"
              >
                {isCustomSupplier ? "Aus vorhandener Liste wählen" : "+ Neuer / Freitext-Lieferant"}
              </button>
            </div>

            {!isCustomSupplier ? (
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
              >
                <option value="">-- Keiner / Unbekannt --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Name des neuen Lieferanten"
                className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
              />
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium block">Notiz / Lieferschein-Nr.</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Lieferschein LS-2026-99"
              className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {isPending ? "Wird gebucht..." : "Wareneingang buchen"}
            </button>
          </div>
        </form>
      </div>

      {/* Shared Quick-Add Brand Modal */}
      <QuickAddBrandModal
        isOpen={showQuickBrandModal}
        onClose={() => setShowQuickBrandModal(false)}
        onSuccess={(created) => {
          setBrandList((prev) => [...prev, { id: created.id, name: created.name }]);
          setSelectedBrandId(created.id);
        }}
      />

      {/* Quick Add Category Mini Modal */}
      {showQuickCategoryModal && (
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
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="z.B. Back Cover"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowQuickCategoryModal(false)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isAddingCategory}
                className="px-4 py-1.5 bg-foreground text-background rounded-lg text-xs font-semibold"
              >
                {isAddingCategory ? "Erstelle..." : "Erstellen & Wählen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Add Device Model Mini Modal */}
      {showQuickModelModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleAddModelInline} className="bg-card w-full max-w-sm rounded-xl p-5 border shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Smartphone className="w-4 h-4 text-accent" />
              <h3 className="font-bold text-sm">Neues Gerätemodell erstellen</h3>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Modellname</label>
              <input
                type="text"
                autoFocus
                required
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="z.B. iPhone 16 Pro Max"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowQuickModelModal(false)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isAddingModel}
                className="px-4 py-1.5 bg-foreground text-background rounded-lg text-xs font-semibold"
              >
                {isAddingModel ? "Erstelle..." : "Erstellen & Wählen"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
