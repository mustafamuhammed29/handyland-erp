"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  Package,
  PackagePlus,
  Tag,
  Smartphone,
  Filter,
  Layers,
  ChevronDown,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { deleteParts, createPart, updatePart, updateStock, createCategory, createDeviceModel } from "../../app/actions/inventory";
import { useRouter } from "next/navigation";
import { getPartTransactions } from "../../app/actions/transactions";
import { StockInModal } from "./StockInModal";
import { QuickAddBrandModal } from "./QuickAddBrandModal";

type Part = any;

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

interface SupplierItem {
  id: string;
  name: string;
}

interface ModelGroup {
  key: string;
  modelName: string;
  brandName: string;
  deviceModelId?: string | null;
  parts: Part[];
  hasLowStock: boolean;
  totalStock: number;
}

export function InventoryTableClient({
  initialParts,
  brands = [],
  categories = [],
  deviceModels = [],
  suppliers = [],
}: {
  initialParts: Part[];
  brands?: BrandItem[];
  categories?: CategoryItem[];
  deviceModels?: DeviceModelItem[];
  suppliers?: SupplierItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Dynamic Lists for Brands, Categories, Models
  const [brandList, setBrandList] = useState<BrandItem[]>(brands);
  const [categoryList, setCategoryList] = useState<CategoryItem[]>(categories);
  const [deviceModelList, setDeviceModelList] = useState<DeviceModelItem[]>(deviceModels);

  // Top Table Filters
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>("ALL");

  // Accordion Expansion State & Pagination
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(new Set());
  const [visibleGroupCount, setVisibleGroupCount] = useState<number>(15);

  // Stock-In Modal State
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [stockInPartId, setStockInPartId] = useState<string | null>(null);

  // Edit/Add Part Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"edit" | "history">("edit");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Form Brand selection state for cascading device models
  const [selectedFormBrandId, setSelectedFormBrandId] = useState<string>("");

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
    minQuantity: 1,
    price: "",
    cost: "",
    location: "",
    supplierId: "",
  });

  // Inline Quick Add Modals State
  const [showInlineBrandModal, setShowInlineBrandModal] = useState(false);

  const [showInlineCategoryModal, setShowInlineCategoryModal] = useState(false);
  const [newInlineCatName, setNewInlineCatName] = useState("");
  const [isAddingInlineCat, setIsAddingInlineCat] = useState(false);

  const [showInlineModelModal, setShowInlineModelModal] = useState(false);
  const [newInlineModelName, setNewInlineModelName] = useState("");
  const [isAddingInlineModel, setIsAddingInlineModel] = useState(false);

  // Cascading models for top filter
  const availableModelsForFilter = selectedBrandFilter === "ALL"
    ? deviceModelList
    : deviceModelList.filter((m) => {
        const brandObj = brandList.find((b) => b.id === selectedBrandFilter);
        return m.brandId === selectedBrandFilter || (brandObj && m.brand.toLowerCase() === brandObj.name.toLowerCase());
      });

  // Cascading models for Add/Edit Form
  const availableModelsForForm = !selectedFormBrandId
    ? deviceModelList
    : deviceModelList.filter((m) => {
        const brandObj = brandList.find((b) => b.id === selectedFormBrandId);
        return m.brandId === selectedFormBrandId || (brandObj && m.brand.toLowerCase() === brandObj.name.toLowerCase());
      });

  // Filter Parts with Safe Defaults
  const filteredParts = useMemo(() => {
    return initialParts.filter((part) => {
      const searchString = searchQuery.toLowerCase();
      const matchesSearch =
        part.name.toLowerCase().includes(searchString) ||
        (part.sku && part.sku.toLowerCase().includes(searchString)) ||
        (part.category && part.category.toLowerCase().includes(searchString)) ||
        (part.brand && part.brand.toLowerCase().includes(searchString)) ||
        (part.deviceModel && part.deviceModel.toLowerCase().includes(searchString)) ||
        (part.location && part.location.toLowerCase().includes(searchString));

      if (!matchesSearch) return false;

      // Brand Filter
      if (selectedBrandFilter !== "ALL") {
        const brandObj = brandList.find((b) => b.id === selectedBrandFilter);
        const targetBrandName = brandObj ? brandObj.name.toLowerCase() : "";
        const partBrand = (part.brand || "").toLowerCase();
        if (partBrand !== targetBrandName) return false;
      }

      // Category Filter
      if (selectedCategoryFilter !== "ALL") {
        const catObj = categoryList.find((c) => c.id === selectedCategoryFilter);
        const targetCatName = catObj ? catObj.name.toLowerCase() : "";
        const partCat = (part.category || "").toLowerCase();
        if (partCat !== targetCatName && part.categoryId !== selectedCategoryFilter) return false;
      }

      // Model Filter
      if (selectedModelFilter !== "ALL") {
        const modelObj = deviceModelList.find((m) => m.id === selectedModelFilter);
        const targetModelName = modelObj ? modelObj.modelName.toLowerCase() : "";
        const partModel = (part.deviceModel || "").toLowerCase();
        if (partModel !== targetModelName && part.deviceModelId !== selectedModelFilter) return false;
      }

      return true;
    });
  }, [initialParts, searchQuery, selectedBrandFilter, selectedCategoryFilter, selectedModelFilter, brandList, categoryList, deviceModelList]);

  // Group Parts by Device Model
  const modelGroups: ModelGroup[] = useMemo(() => {
    const groupsMap = new Map<string, ModelGroup>();

    filteredParts.forEach((part) => {
      const modelName = part.deviceModel || "Andere / Ohne Modell";
      const brandName = part.brand || "Allgemein";
      const groupKey = `${brandName}___${modelName}`;

      const isPartLowStock = part.quantity < part.minQuantity;

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          key: groupKey,
          modelName,
          brandName,
          deviceModelId: part.deviceModelId,
          parts: [],
          hasLowStock: false,
          totalStock: 0,
        });
      }

      const grp = groupsMap.get(groupKey)!;
      grp.parts.push(part);
      grp.totalStock += part.quantity;
      if (isPartLowStock) {
        grp.hasLowStock = true;
      }
    });

    return Array.from(groupsMap.values());
  }, [filteredParts]);

  // Auto-Expand Logic: Auto-expand groups containing low stock items OR when a search query is active
  useEffect(() => {
    const initialExpanded = new Set<string>();
    const isSearchOrFilterActive = searchQuery.trim() !== "" || selectedModelFilter !== "ALL" || selectedCategoryFilter !== "ALL";

    modelGroups.forEach((group) => {
      if (group.hasLowStock || isSearchOrFilterActive) {
        initialExpanded.add(group.key);
      }
    });

    setExpandedGroupKeys(initialExpanded);
  }, [modelGroups, searchQuery, selectedModelFilter, selectedCategoryFilter]);

  const toggleGroupExpand = (groupKey: string) => {
    setExpandedGroupKeys((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

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
    setSelectedFormBrandId("");
    setFormData({
      name: "",
      categoryId: "",
      category: "",
      deviceModelId: "",
      brand: "",
      deviceModel: "",
      sku: "",
      quantity: 0,
      minQuantity: 1,
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
    setTransactions([]);

    // Find brandId from brand name
    let matchedBrandId = "";
    if (part.brand) {
      const bObj = brandList.find((b) => b.name.toLowerCase() === part.brand.toLowerCase());
      if (bObj) matchedBrandId = bObj.id;
    }
    setSelectedFormBrandId(matchedBrandId);

    setFormData({
      name: part.name || "",
      categoryId: part.categoryId || "",
      category: part.category || "",
      deviceModelId: part.deviceModelId || "",
      brand: part.brand || "",
      deviceModel: part.deviceModel || "",
      sku: part.sku || "",
      quantity: part.quantity || 0,
      minQuantity: part.minQuantity ?? 1,
      price: part.price || "",
      cost: part.cost || "",
      location: part.location || "",
      supplierId: part.supplierId || "",
    });
    setIsModalOpen(true);

    setIsLoadingTransactions(true);
    const txs = await getPartTransactions(part.id);
    setTransactions(txs.transactions || []);
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
    if (!selectedFormBrandId || !newInlineModelName.trim()) return;

    const brandObj = brandList.find((b) => b.id === selectedFormBrandId);
    const brandName = brandObj ? brandObj.name : "";

    setIsAddingInlineModel(true);
    const res = await createDeviceModel(brandName, newInlineModelName.trim(), selectedFormBrandId);
    setIsAddingInlineModel(false);

    if (res.success && res.deviceModel) {
      const created = {
        id: res.deviceModel.id,
        brand: res.deviceModel.brand,
        brandId: res.deviceModel.brandId || selectedFormBrandId,
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

  const visibleGroups = modelGroups.slice(0, visibleGroupCount);

  return (
    <div className="space-y-4">
      {/* Table Toolbar & Filters */}
      <div className="bg-card p-4 rounded-xl shadow-sm border space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
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

          <div className="flex gap-2 w-full sm:w-auto justify-end">
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

        {/* Filter Dropdowns (Brand -> Cascading Model -> Category) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t text-xs">
          <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-1">
            <label className="text-muted-foreground">Marke:</label>
            <select
              value={selectedBrandFilter}
              onChange={(e) => {
                setSelectedBrandFilter(e.target.value);
                setSelectedModelFilter("ALL"); // Reset model filter when brand changes
              }}
              className="px-2 py-1 border rounded-md bg-background text-xs font-medium"
            >
              <option value="ALL">Alle Marken</option>
              {brandList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Filter (Cascaded by Brand Filter) */}
          <div className="flex items-center gap-1">
            <label className="text-muted-foreground">Modell:</label>
            <select
              value={selectedModelFilter}
              onChange={(e) => setSelectedModelFilter(e.target.value)}
              className="px-2 py-1 border rounded-md bg-background text-xs font-medium"
            >
              <option value="ALL">Alle Modelle</option>
              {availableModelsForFilter.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brand} {m.modelName}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <label className="text-muted-foreground">Kategorie:</label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-2 py-1 border rounded-md bg-background text-xs font-medium"
            >
              <option value="ALL">Alle Kategorien</option>
              {categoryList.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Expand / Collapse All Controls */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setExpandedGroupKeys(new Set(modelGroups.map((g) => g.key)))}
              className="text-[11px] text-muted-foreground hover:text-foreground underline"
            >
              Alle ausklappen
            </button>
            <span className="text-muted-foreground/40">|</span>
            <button
              onClick={() => setExpandedGroupKeys(new Set())}
              className="text-[11px] text-muted-foreground hover:text-foreground underline"
            >
              Alle einklappen
            </button>
          </div>

          {/* Reset Filters */}
          {(selectedBrandFilter !== "ALL" || selectedCategoryFilter !== "ALL" || selectedModelFilter !== "ALL" || searchQuery.trim() !== "") && (
            <button
              onClick={() => {
                setSelectedBrandFilter("ALL");
                setSelectedCategoryFilter("ALL");
                setSelectedModelFilter("ALL");
                setSearchQuery("");
              }}
              className="text-accent hover:underline font-medium"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Accordion Grouped Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredParts.length && filteredParts.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Teil & SKU</th>
                <th className="px-4 py-3 font-medium">Kategorie</th>
                <th className="px-4 py-3 font-medium text-right">Lagerbestand</th>
                <th className="px-4 py-3 font-medium text-right">VK-Preis</th>
                <th className="px-4 py-3 font-medium text-right">EK-Preis</th>
                <th className="px-4 py-3 font-medium text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {modelGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Keine Teile gefunden.
                  </td>
                </tr>
              ) : (
                visibleGroups.map((group) => {
                  const isExpanded = expandedGroupKeys.has(group.key);

                  return (
                    <React.Fragment key={group.key}>
                      {/* Accordion Group Header Row */}
                      <tr
                        onClick={() => toggleGroupExpand(group.key)}
                        className={`cursor-pointer transition-colors border-t border-b ${
                          isExpanded ? "bg-muted/60 dark:bg-muted/40 font-bold" : "bg-muted/20 hover:bg-muted/40"
                        }`}
                      >
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleGroupExpand(group.key)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                        <td colSpan={2} className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-display font-bold text-base text-foreground">
                              {group.modelName}
                            </span>

                            <span className="px-2 py-0.5 rounded-full bg-background border text-xs font-semibold text-muted-foreground">
                              {group.brandName}
                            </span>

                            <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-medium">
                              {group.parts.length} {group.parts.length === 1 ? "Teil" : "Teile"}
                            </span>

                            {group.hasLowStock && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 text-xs font-semibold flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                                Lagerwarnung
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right font-mono font-bold">
                          <span className={group.hasLowStock ? "text-red-500" : "text-muted-foreground"}>
                            {group.totalStock} Stk. Gesamt
                          </span>
                        </td>

                        <td colSpan={3} className="px-4 py-3 text-right text-xs text-muted-foreground font-normal">
                          {isExpanded ? "Klicken zum Einklappen" : "Klicken zum Ausklappen"}
                        </td>
                      </tr>

                      {/* Group Child Item Rows */}
                      {isExpanded &&
                        group.parts.map((part) => {
                          const isLowStock = part.quantity < part.minQuantity;

                          return (
                            <tr key={part.id} className="hover:bg-muted/30 transition-colors bg-background/50">
                              <td className="px-4 py-3 pl-8">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(part.id)}
                                  onChange={() => toggleSelect(part.id)}
                                  className="rounded border-gray-300"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-foreground flex items-center gap-2">
                                  {part.name}
                                </div>
                                {part.sku && <div className="text-xs text-muted-foreground font-mono">SKU: {part.sku}</div>}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium border">
                                  {part.category || "Allgemein"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleQuickStockChange(part.id, -1)}
                                    disabled={part.quantity <= 0}
                                    className="w-6 h-6 rounded bg-muted hover:bg-muted/80 flex items-center justify-center text-xs disabled:opacity-30 font-bold"
                                  >
                                    -
                                  </button>
                                  <span className={`font-mono font-bold px-2 ${isLowStock ? "text-red-500" : ""}`}>
                                    {part.quantity} Stk.
                                  </span>
                                  <button
                                    onClick={() => handleQuickStockChange(part.id, 1)}
                                    className="w-6 h-6 rounded bg-muted hover:bg-muted/80 flex items-center justify-center text-xs font-bold"
                                  >
                                    +
                                  </button>
                                  {isLowStock && (
                                    <span title="Niedriger Lagerbestand">
                                      <AlertTriangle className="w-4 h-4 text-red-500 ml-1" />
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-semibold">€{Number(part.price).toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                                {part.cost ? `€${Number(part.cost).toFixed(2)}` : "-"}
                              </td>
                              <td className="px-4 py-3 text-right">
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
                        })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Group Pagination Footer / Load More */}
        {modelGroups.length > 0 && (
          <div className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Zeige <span className="font-bold text-foreground">{Math.min(visibleGroupCount, modelGroups.length)}</span> von{" "}
              <span className="font-bold text-foreground">{modelGroups.length}</span> Gerätemodellen (
              <span className="font-bold text-foreground">{filteredParts.length}</span> Teile insgesamt)
            </div>

            {visibleGroupCount < modelGroups.length && (
              <button
                onClick={() => setVisibleGroupCount((prev) => prev + 15)}
                className="px-4 py-2 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <ChevronDown className="w-4 h-4" />
                Mehr Modelle laden (+15)
              </button>
            )}
          </div>
        )}
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
        brands={brandList}
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

                  <div className="grid grid-cols-3 gap-3">
                    {/* Brand Dropdown + Quick Add */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium">Marke</label>
                        <button
                          type="button"
                          onClick={() => setShowInlineBrandModal(true)}
                          className="text-[11px] text-accent hover:underline flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> Neu
                        </button>
                      </div>
                      <select
                        value={selectedFormBrandId}
                        onChange={(e) => {
                          const brandId = e.target.value;
                          const bObj = brandList.find((b) => b.id === brandId);
                          setSelectedFormBrandId(brandId);
                          setFormData({
                            ...formData,
                            brand: bObj ? bObj.name : "",
                            deviceModelId: "",
                            deviceModel: "",
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-sm"
                      >
                        <option value="">-- Keine Marke --</option>
                        {brandList.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Device Model Dropdown (Cascaded by selected brand) + Inline Quick Add */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label htmlFor="deviceModel" className="text-xs font-medium">
                          Gerätemodell
                        </label>
                        <button
                          type="button"
                          disabled={!selectedFormBrandId}
                          onClick={() => setShowInlineModelModal(true)}
                          className="text-[11px] text-accent hover:underline flex items-center gap-0.5 disabled:opacity-40"
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
                            brand: foundModel ? foundModel.brand : formData.brand,
                            deviceModel: foundModel ? foundModel.modelName : "",
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-sm"
                      >
                        <option value="">-- Keines / Universell --</option>
                        {availableModelsForForm.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.modelName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category Dropdown + Inline Quick Add */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label htmlFor="category" className="text-xs font-medium">
                          Kategorie
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowInlineCategoryModal(true)}
                          className="text-[11px] text-accent hover:underline flex items-center gap-0.5"
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
                        placeholder="z.B. DISP-IP13-BLK"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="price" className="text-sm font-medium">
                        Verkaufspreis (€) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="price"
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="quantity" className="text-sm font-medium">
                        Bestand (Stk.)
                      </label>
                      <input
                        id="quantity"
                        type="number"
                        min="0"
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
                        min="0"
                        value={formData.minQuantity}
                        onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 0 })}
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
                        placeholder="0.00"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Lagerbewegungshistorie</h3>
                  {isLoadingTransactions ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">Lade Historie...</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">Keine Transaktionen aufgezeichnet.</div>
                  ) : (
                    <div className="space-y-2">
                      {transactions.map((tx: any) => (
                        <div key={tx.id} className="p-3 border rounded-lg bg-muted/30 text-xs flex justify-between items-center">
                          <div>
                            <span className="font-semibold block">{tx.type}</span>
                            <span className="text-muted-foreground">{new Date(tx.createdAt).toLocaleString("de-DE")}</span>
                            {tx.notes && <span className="block text-muted-foreground italic mt-0.5">{tx.notes}</span>}
                          </div>
                          <div className="text-right">
                            <span className={`font-mono font-bold ${tx.quantityChange > 0 ? "text-green-600" : "text-red-500"}`}>
                              {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange} Stk.
                            </span>
                            <span className="block text-muted-foreground font-mono">
                              Neu: {tx.newQuantity} Stk.
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t pt-4 mt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                Abbrechen
              </button>
              {activeModalTab === "edit" && (
                <button
                  type="submit"
                  form="partForm"
                  disabled={isPending}
                  className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isPending ? "Speichern..." : "Speichern"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reusable Quick-Add Brand Modal */}
      <QuickAddBrandModal
        isOpen={showInlineBrandModal}
        onClose={() => setShowInlineBrandModal(false)}
        onSuccess={(created) => {
          setBrandList((prev) => [...prev, { id: created.id, name: created.name }]);
          setSelectedFormBrandId(created.id);
          setFormData((prev) => ({ ...prev, brand: created.name, deviceModelId: "", deviceModel: "" }));
        }}
      />

      {/* Inline Quick Add Category Mini Modal */}
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
                placeholder="z.B. Back Cover"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowInlineCategoryModal(false)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-muted"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isAddingInlineCat}
                className="px-4 py-1.5 bg-foreground text-background rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {isAddingInlineCat ? "Erstelle..." : "Erstellen & Wählen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inline Quick Add Device Model Mini Modal */}
      {showInlineModelModal && (
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
                value={newInlineModelName}
                onChange={(e) => setNewInlineModelName(e.target.value)}
                placeholder="z.B. iPhone 16 Pro Max"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowInlineModelModal(false)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-muted"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isAddingInlineModel}
                className="px-4 py-1.5 bg-foreground text-background rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {isAddingInlineModel ? "Erstelle..." : "Erstellen & Wählen"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
