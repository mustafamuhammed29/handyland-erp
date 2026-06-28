"use client";

import { useState } from "react";
import { updateRepairPrice } from "../../../actions/repair";
import { Banknote, Calendar, Save, Check } from "lucide-react";

export default function PriceEditor({ 
  repairId, 
  currentPrice, 
  currentPickupDate 
}: { 
  repairId: string; 
  currentPrice: number | null; 
  currentPickupDate: string | null;
}) {
  const [price, setPrice] = useState(currentPrice?.toString() || "");
  const [pickupDate, setPickupDate] = useState(currentPickupDate || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!price) return;
    setSaving(true);
    setSaved(false);
    const res = await updateRepairPrice(repairId, parseFloat(price), pickupDate || null);
    setSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-medium flex items-center gap-2 mb-4 pb-2 border-b">
        <Banknote className="h-5 w-5 text-green-500" /> Preiskalkulation
      </h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="price-input" className="text-xs text-muted-foreground block">Reparaturpreis (€)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">€</span>
            <input
              id="price-input"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              title="Reparaturpreis"
              className="w-full pl-8 pr-4 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="pickup-input" className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Geschätzter Abholtermin
          </label>
          <input
            id="pickup-input"
            type="datetime-local"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            title="Geschätzter Abholtermin"
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !price}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? "Gespeichert!" : "Angebot speichern"}
        </button>
      </div>
    </div>
  );
}
