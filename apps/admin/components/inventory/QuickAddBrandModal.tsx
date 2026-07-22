"use client";

import React, { useState } from "react";
import { Tag } from "lucide-react";
import { createBrand } from "../../app/actions/inventory";

interface QuickAddBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBrand: { id: string; name: string }) => void;
}

export function QuickAddBrandModal({ isOpen, onClose, onSuccess }: QuickAddBrandModalProps) {
  const [brandName, setBrandName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = brandName.trim();
    if (!trimmed) return;

    setIsLoading(true);
    const res = await createBrand(trimmed);
    setIsLoading(false);

    if (res.success && res.brand) {
      onSuccess({ id: res.brand.id, name: res.brand.name });
      setBrandName("");
      onClose();
    } else {
      alert("Fehler: " + (res.error || "Marke konnte nicht erstellt werden."));
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="bg-card w-full max-w-sm rounded-xl p-5 border shadow-2xl space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Tag className="w-4 h-4 text-accent" />
          <h3 className="font-bold text-sm">Neue Marke erstellen</h3>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">Markenname</label>
          <input
            type="text"
            autoFocus
            required
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="z.B. Apple, Samsung, Google..."
            className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-muted"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-1.5 bg-foreground text-background rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "Erstelle..." : "Erstellen & Wählen"}
          </button>
        </div>
      </form>
    </div>
  );
}
