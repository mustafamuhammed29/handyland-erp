"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ShoppingCart, Package, Users, Truck } from "lucide-react";

export function TabSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  
  const isOrders = pathname === "/inventory" && tab !== "stock";
  const isStock = pathname === "/inventory" && tab === "stock";
  const isSuppliers = pathname === "/inventory/suppliers";
  const isPO = pathname === "/inventory/po";

  return (
    <div className="flex flex-wrap gap-1 p-1 bg-muted rounded-xl w-fit border">
      <Link
        href="/inventory?tab=orders"
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          isOrders ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ShoppingCart className="w-4 h-4" />
        Kundenbestellungen
      </Link>
      <Link
        href="/inventory?tab=stock"
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          isStock ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Package className="w-4 h-4" />
        Lagerbestand
      </Link>
      <Link
        href="/inventory/suppliers"
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          isSuppliers ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Users className="w-4 h-4" />
        Lieferanten
      </Link>
      <Link
        href="/inventory/po"
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          isPO ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Truck className="w-4 h-4" />
        Lieferantenbestellungen
      </Link>
    </div>
  );
}
