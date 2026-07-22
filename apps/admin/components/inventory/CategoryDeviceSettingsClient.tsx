"use client";

import React, { useState, useTransition } from "react";
import { Tag, Smartphone, Plus, Trash2, Edit2, AlertCircle, Check, ShieldAlert } from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createDeviceModel,
  deleteDeviceModel,
} from "../../app/actions/inventory";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  partsCount: number;
}

interface DeviceModel {
  id: string;
  brand: string;
  modelName: string;
  partsCount: number;
}

interface CategoryDeviceSettingsClientProps {
  initialCategories: Category[];
  initialDeviceModels: DeviceModel[];
}

export function CategoryDeviceSettingsClient({
  initialCategories,
  initialDeviceModels,
}: CategoryDeviceSettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"categories" | "models">("categories");

  // Category Add State
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // Device Model Add State
  const [newModelBrand, setNewModelBrand] = useState("Apple");
  const [newModelName, setNewModelName] = useState("");

  // Error / Warning Dialog State
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // --- Category Handlers ---
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    startTransition(async () => {
      const res = await createCategory(newCategoryName.trim());
      if (res.success) {
        setNewCategoryName("");
        router.refresh();
      } else {
        alert(res.error || "Fehler beim Erstellen der Kategorie.");
      }
    });
  };

  const handleStartEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setEditCategoryName(cat.name);
  };

  const handleSaveEditCategory = (id: string) => {
    if (!editCategoryName.trim()) return;

    startTransition(async () => {
      const res = await updateCategory(id, editCategoryName.trim());
      if (res.success) {
        setEditingCategoryId(null);
        router.refresh();
      } else {
        alert(res.error || "Fehler beim Aktualisieren der Kategorie.");
      }
    });
  };

  const handleDeleteCategory = (cat: Category) => {
    if (cat.partsCount > 0) {
      setWarningMessage(
        `Kategorie "${cat.name}" kann nicht gelöscht werden, da sie noch von ${cat.partsCount} Teil(en) im Lager verwendet wird.`
      );
      return;
    }

    if (confirm(`Möchten Sie die Kategorie "${cat.name}" wirklich löschen?`)) {
      startTransition(async () => {
        const res = await deleteCategory(cat.id);
        if (res.success) {
          router.refresh();
        } else {
          setWarningMessage(res.error || "Fehler beim Löschen der Kategorie.");
        }
      });
    }
  };

  // --- Device Model Handlers ---
  const handleCreateDeviceModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelBrand.trim() || !newModelName.trim()) return;

    startTransition(async () => {
      const res = await createDeviceModel(newModelBrand.trim(), newModelName.trim());
      if (res.success) {
        setNewModelName("");
        router.refresh();
      } else {
        alert(res.error || "Fehler beim Erstellen des Gerätemodells.");
      }
    });
  };

  const handleDeleteDeviceModel = (model: DeviceModel) => {
    if (model.partsCount > 0) {
      setWarningMessage(
        `Gerätemodell "${model.brand} ${model.modelName}" kann nicht gelöscht werden, da es noch von ${model.partsCount} Teil(en) im Lager verwendet wird.`
      );
      return;
    }

    if (confirm(`Möchten Sie das Modell "${model.brand} ${model.modelName}" wirklich löschen?`)) {
      startTransition(async () => {
        const res = await deleteDeviceModel(model.id);
        if (res.success) {
          router.refresh();
        } else {
          setWarningMessage(res.error || "Fehler beim Löschen des Gerätemodells.");
        }
      });
    }
  };

  // Group models by brand
  const groupedModels = initialDeviceModels.reduce((acc, m) => {
    const brand = m.brand || "Andere";
    if (!acc[brand]) acc[brand] = [];
    acc[brand].push(m);
    return acc;
  }, {} as Record<string, DeviceModel[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Inventar-Einstellungen</h2>
        <p className="text-xs text-muted-foreground">
          Dynamische Kategorien und Gerätemodelle für Ersatzteile verwalten.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b gap-4">
        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "categories"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tag className="w-4 h-4" />
          Kategorien ({initialCategories.length})
        </button>
        <button
          onClick={() => setActiveTab("models")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "models"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Gerätemodelle ({initialDeviceModels.length})
        </button>
      </div>

      {/* Warning Alert Modal */}
      {warningMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl p-6 border shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base">Löschen nicht möglich</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{warningMessage}</p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setWarningMessage(null)}
                className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-semibold hover:opacity-90"
              >
                Verstanden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Category Form */}
          <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-accent" /> Neue Kategorie hinzufügen
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="text-xs font-medium block mb-1">Kategoriename</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="z.B. Kamera Glass, Back Cover"
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
                />
              </div>
              <button
                type="submit"
                disabled={isPending || !newCategoryName.trim()}
                className="w-full py-2 bg-foreground text-background rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending ? "Speichern..." : "Kategorie hinzufügen"}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="md:col-span-2 bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/40 font-semibold text-xs text-muted-foreground flex justify-between">
              <span>Kategorie</span>
              <span>Zugeordnete Teile</span>
            </div>
            <div className="divide-y divide-border">
              {initialCategories.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">Keine Kategorien vorhanden.</div>
              ) : (
                initialCategories.map((cat) => (
                  <div key={cat.id} className="p-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    {editingCategoryId === cat.id ? (
                      <div className="flex items-center gap-2 flex-1 mr-4">
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          className="px-2 py-1 border rounded text-xs bg-background flex-1"
                        />
                        <button
                          onClick={() => handleSaveEditCategory(cat.id)}
                          className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                        {cat.name}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-mono font-medium text-muted-foreground border">
                        {cat.partsCount} Teile
                      </span>
                      {editingCategoryId !== cat.id && (
                        <button
                          onClick={() => handleStartEditCategory(cat)}
                          className="p-1 text-muted-foreground hover:text-foreground rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className={`p-1 rounded ${
                          cat.partsCount > 0
                            ? "text-muted-foreground/50 hover:text-amber-500"
                            : "text-muted-foreground hover:text-red-500"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DEVICE MODELS TAB */}
      {activeTab === "models" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Device Model Form */}
          <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-accent" /> Neues Gerätemodell hinzufügen
            </h3>
            <form onSubmit={handleCreateDeviceModel} className="space-y-3">
              <div>
                <label className="text-xs font-medium block mb-1">Marke</label>
                <input
                  type="text"
                  required
                  value={newModelBrand}
                  onChange={(e) => setNewModelBrand(e.target.value)}
                  placeholder="z.B. Apple, Samsung"
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Modellname</label>
                <input
                  type="text"
                  required
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="z.B. iPhone 16 Pro Max"
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
                />
              </div>
              <button
                type="submit"
                disabled={isPending || !newModelBrand.trim() || !newModelName.trim()}
                className="w-full py-2 bg-foreground text-background rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending ? "Speichern..." : "Modell hinzufügen"}
              </button>
            </form>
          </div>

          {/* Device Models Grouped List */}
          <div className="md:col-span-2 space-y-4">
            {Object.keys(groupedModels).length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-xs text-muted-foreground">
                Keine Gerätemodelle vorhanden.
              </div>
            ) : (
              Object.entries(groupedModels).map(([brand, models]) => (
                <div key={brand} className="bg-card border rounded-xl shadow-sm overflow-hidden">
                  <div className="p-3 px-4 border-b bg-muted/40 font-bold text-xs flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-accent" /> {brand}
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground">{models.length} Modelle</span>
                  </div>
                  <div className="divide-y divide-border">
                    {models.map((model) => (
                      <div key={model.id} className="p-3 px-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <span className="text-sm font-medium">{model.modelName}</span>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-mono font-medium text-muted-foreground border">
                            {model.partsCount} Teile
                          </span>
                          <button
                            onClick={() => handleDeleteDeviceModel(model)}
                            className={`p-1 rounded ${
                              model.partsCount > 0
                                ? "text-muted-foreground/50 hover:text-amber-500"
                                : "text-muted-foreground hover:text-red-500"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
