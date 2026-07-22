import { prisma } from "@repo/database";
import Link from "next/link";
import { InventoryTableClient } from "../../../components/inventory/InventoryTableClient";
import { PartOrdersClient } from "../../../components/inventory/PartOrdersClient";
import { LowStockAlertsClient } from "../../../components/inventory/LowStockAlertsClient";
import { TabSwitcher } from "../../../components/inventory/TabSwitcher";

export const dynamic = "force-dynamic";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  let activeTab = "stock";
  if (tab === "orders") activeTab = "orders";
  if (tab === "alerts") activeTab = "alerts";
  if (tab === "stock") activeTab = "stock";

  // Fetch part orders with customer info
  const partOrders = await prisma.partOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
    },
  });

  // Fetch all customers for the "Add Order" dropdown
  const customers = await prisma.customer.findMany({
    select: { id: true, firstName: true, lastName: true, phone: true, email: true },
    orderBy: { firstName: "asc" },
  });

  // Fetch stock parts
  const parts = await prisma.part.findMany({ orderBy: { name: "asc" } });

  // Fetch categories, deviceModels, suppliers
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const deviceModels = await prisma.deviceModel.findMany({
    orderBy: [{ brand: "asc" }, { modelName: "asc" }],
  });
  const suppliers = await prisma.supplier.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Serialize: map to plain objects — no Prisma Decimal / Date references
  const serializedOrders = partOrders.map((o) => ({
    id: o.id,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    customerId: o.customerId,
    partName: o.partName,
    description: o.description ?? null,
    notes: o.notes ?? null,
    status: o.status,
    orderedAt: o.orderedAt?.toISOString() ?? null,
    arrivedAt: o.arrivedAt?.toISOString() ?? null,
    estimatedPrice: o.estimatedPrice != null ? o.estimatedPrice.toString() : null,
    customer: {
      id: o.customer.id,
      firstName: o.customer.firstName,
      lastName: o.customer.lastName,
      phone: o.customer.phone,
      email: o.customer.email ?? null,
    },
  }));

  const serializedParts = parts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    price: p.price.toString(),
    cost: p.cost ? p.cost.toString() : null,
  }));

  const serializedCategories = categories.map((c) => ({ id: c.id, name: c.name }));
  const serializedDeviceModels = deviceModels.map((m) => ({ id: m.id, brand: m.brand, modelName: m.modelName }));
  const serializedSuppliers = suppliers.map((s) => ({ id: s.id, name: s.name }));

  const lowStockParts = serializedParts.filter((p) => p.quantity <= p.minQuantity);

  // Stats
  const pendingOrders = partOrders.filter((o) => o.status === "PENDING" || o.status === "ORDERED").length;
  const arrivedOrders = partOrders.filter((o) => o.status === "ARRIVED" || o.status === "NOTIFIED").length;
  const lowStockItemsCount = lowStockParts.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Inventar & Bestellungen</h1>
          <p className="text-muted-foreground">Teilbestellungen für Kunden verwalten und Lagerbestand im Blick behalten.</p>
        </div>
        {/* Quick Stats */}
        <div className="flex gap-3 shrink-0">
          {pendingOrders > 0 && (
            <Link href="/inventory?tab=orders" className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-xl px-4 py-2 text-center hover:bg-yellow-500/20 transition-colors">
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <div className="text-xs font-medium">Ausstehend</div>
            </Link>
          )}
          {arrivedOrders > 0 && (
            <Link href="/inventory?tab=orders" className="bg-purple-500/10 border border-purple-500/20 text-purple-600 rounded-xl px-4 py-2 text-center hover:bg-purple-500/20 transition-colors">
              <div className="text-2xl font-bold">{arrivedOrders}</div>
              <div className="text-xs font-medium">Eingetroffen</div>
            </Link>
          )}
          {lowStockItemsCount > 0 && (
            <Link href="/inventory?tab=alerts" className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-4 py-2 text-center hover:bg-red-500/20 transition-colors">
              <div className="text-2xl font-bold">{lowStockItemsCount}</div>
              <div className="text-xs font-medium">Lagerwarnung</div>
            </Link>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <TabSwitcher />

      {/* Tab Content */}
      {activeTab === "orders" && <PartOrdersClient initialOrders={serializedOrders} customers={customers} />}
      {activeTab === "alerts" && (
        <LowStockAlertsClient
          lowStockParts={lowStockParts}
          allParts={serializedParts}
          suppliers={serializedSuppliers}
          categories={serializedCategories}
          deviceModels={serializedDeviceModels}
        />
      )}
      {activeTab === "stock" && (
        <InventoryTableClient
          initialParts={serializedParts}
          categories={serializedCategories}
          deviceModels={serializedDeviceModels}
          suppliers={serializedSuppliers}
        />
      )}
    </div>
  );
}
