"use client";

import React, { useState } from "react";
import { AlertTriangle, Search, PackagePlus, ArrowDown, Filter, CheckCircle2 } from "lucide-react";
import { StockInModal } from "./StockInModal";

interface Part {
  id: string;
  name: string;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  deviceModel?: string | null;
  quantity: number;
  minQuantity: number;
  price: string | number;
  cost?: string | null;
  location?: string | null;
}

interface LowStockAlertsClientProps {
  lowStockParts: Part[];
  allParts: Part[];
  suppliers: Array<{ id: string; name: string }>;
  brands?: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  deviceModels: Array<{ id: string; brand: string; modelName: string }>;
}

export function LowStockAlertsClient({
  lowStockParts,
  allParts,
  suppliers,
  brands: initialBrands = [],
  categories,
  deviceModels,
}: LowStockAlertsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  // Stock-In Modal State
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [selectedPartForStockIn, setSelectedPartForStockIn] = useState<string | null>(null);

  // Extract distinct brands
  const brands = Array.from(new Set(lowStockParts.map((p) => p.brand).filter(Boolean))) as string[];

  // Filter Logic
  const filteredParts = lowStockParts.filter((part) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      part.name.toLowerCase().includes(query) ||
      (part.sku && part.sku.toLowerCase().includes(query)) ||
      (part.category && part.category.toLowerCase().includes(query)) ||
      (part.deviceModel && part.deviceModel.toLowerCase().includes(query));

    const matchesCategory = selectedCategory === "all" || part.category === selectedCategory;
    const matchesBrand = selectedBrand === "all" || part.brand === selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleOpenStockIn = (partId: string) => {
    setSelectedPartForStockIn(partId);
    setIsStockInOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Alert Header Banner */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500 text-white rounded-xl shadow font-bold flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Kritischer Lagerbestand ({lowStockParts.length} Artikel)
            </h2>
            <p className="text-xs text-muted-foreground">
              Diese Artikel haben den Mindestbestand erreicht oder unterschritten.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-card p-4 rounded-xl border shadow-sm justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nach Artikel, SKU oder Modell suchen..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-background border px-3 py-1.5 rounded-lg text-xs font-medium">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">Alle Kategorien</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          {brands.length > 0 && (
            <div className="flex items-center gap-2 bg-background border px-3 py-1.5 rounded-lg text-xs font-medium">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">Alle Marken</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Alerts Grid / Table */}
      {filteredParts.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto opacity-80" />
          <h3 className="text-base font-bold">Keine kritischen Lagerwarnungen</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {lowStockParts.length === 0
              ? "Alle Ersatzteile im Lager befinden sich über dem festgelegten Mindestbestand."
              : "Keine Artikel entsprechen den ausgewählten Filterkriterien."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParts.map((part) => {
            const deficit = Math.max(0, part.minQuantity - part.quantity);
            const isOutOfStock = part.quantity === 0;

            return (
              <div
                key={part.id}
                className={`bg-card rounded-xl border p-5 shadow-sm flex flex-col justify-between transition-all hover:border-red-500/40 relative overflow-hidden ${
                  isOutOfStock ? "border-red-500/50 bg-red-50/20 dark:bg-red-950/10" : ""
                }`}
              >
                {isOutOfStock && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Ausverkauft
                  </span>
                )}

                <div>
                  <div className="flex items-start justify-between gap-2 mb-2 pr-12">
                    <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-semibold text-muted-foreground border">
                      {part.category || "Allgemein"}
                    </span>
                    {part.brand && (
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {part.brand} {part.deviceModel || ""}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-foreground text-base line-clamp-2 mb-1">{part.name}</h3>
                  <p className="text-xs font-mono text-muted-foreground mb-4">SKU: {part.sku || "-"}</p>

                  <div className="grid grid-cols-2 gap-2 bg-muted/40 p-3 rounded-lg border text-xs mb-4">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Aktueller Bestand</span>
                      <span className={`font-mono font-bold text-lg ${isOutOfStock ? "text-red-600" : "text-red-500"}`}>
                        {part.quantity} Stk.
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Mindestbestand</span>
                      <span className="font-mono font-semibold text-foreground text-base">{part.minQuantity} Stk.</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t mt-2">
                  <div className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                    <ArrowDown className="w-3.5 h-3.5" />
                    Fehlt: {deficit > 0 ? `${deficit} Stk.` : "Kritisch"}
                  </div>

                  <button
                    onClick={() => handleOpenStockIn(part.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <PackagePlus className="w-3.5 h-3.5" />
                    + Wareneingang
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stock-In Modal instance for Low-Stock alerts */}
      <StockInModal
        isOpen={isStockInOpen}
        onClose={() => {
          setIsStockInOpen(false);
          setSelectedPartForStockIn(null);
        }}
        preselectedPartId={selectedPartForStockIn}
        parts={allParts}
        suppliers={suppliers}
        brands={initialBrands}
        categories={categories}
        deviceModels={deviceModels}
      />
    </div>
  );
}
