"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ShoppingCart, Package, AlertTriangle, Users, Truck, Settings } from "lucide-react";

export function TabSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const isOrders = pathname === "/inventory" && tab === "orders";
  const isStock = pathname === "/inventory" && (tab === "stock" || (!tab && pathname === "/inventory"));
  const isAlerts = pathname === "/inventory" && tab === "alerts";
  const isSuppliers = pathname === "/inventory/suppliers";
  const isPO = pathname === "/inventory/po";
  const isSettings = pathname === "/inventory/settings";

  return (
    <div className="flex flex-wrap gap-1 p-1 bg-muted rounded-xl w-fit border">
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
        href="/inventory?tab=alerts"
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          isAlerts ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <AlertTriangle className="w-4 h-4 text-red-500" />
        Lagerwarnungen
      </Link>

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

      <Link
        href="/inventory/settings"
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          isSettings ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Settings className="w-4 h-4" />
        Einstellungen
      </Link>
    </div>
  );
}
