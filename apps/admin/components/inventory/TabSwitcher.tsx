"use client";

import Link from "next/link";
import { ShoppingCart, Package } from "lucide-react";

export function TabSwitcher({ activeTab }: { activeTab: string }) {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit border">
      <Link
        href="/inventory?tab=orders"
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          activeTab === "orders"
            ? "bg-card shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ShoppingCart className="w-4 h-4" />
        Kundenbestellungen
      </Link>
      <Link
        href="/inventory?tab=stock"
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          activeTab === "stock"
            ? "bg-card shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Package className="w-4 h-4" />
        Lagerbestand
      </Link>
    </div>
  );
}
