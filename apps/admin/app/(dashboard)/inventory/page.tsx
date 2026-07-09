import { prisma } from "@repo/database";
import { InventoryTableClient } from "../../../components/inventory/InventoryTableClient";
import { PartOrdersClient } from "../../../components/inventory/PartOrdersClient";
import { TabSwitcher } from "../../../components/inventory/TabSwitcher";

export const dynamic = "force-dynamic";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "stock" ? "stock" : "orders";

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
  const parts = await prisma.part.findMany({ orderBy: { category: "asc" } });

  // Serialize: map to plain objects — no Prisma Decimal / Date references
  const serializedOrders = partOrders.map(o => ({
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

  const serializedParts = parts.map(p => ({
    ...p,
    price: p.price.toString(),
    cost: p.cost ? p.cost.toString() : null,
  }));

  // Stats
  const pendingOrders = partOrders.filter(o => o.status === "PENDING" || o.status === "ORDERED").length;
  const arrivedOrders = partOrders.filter(o => o.status === "ARRIVED" || o.status === "NOTIFIED").length;
  const lowStockItems = parts.filter(p => p.quantity <= p.minQuantity).length;

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
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <div className="text-xs font-medium">Ausstehend</div>
            </div>
          )}
          {arrivedOrders > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/20 text-purple-600 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold">{arrivedOrders}</div>
              <div className="text-xs font-medium">Eingetroffen</div>
            </div>
          )}
          {lowStockItems > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold">{lowStockItems}</div>
              <div className="text-xs font-medium">Lagerwarnung</div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <TabSwitcher />

      {/* Tab Content */}
      {activeTab === "orders" ? (
        <PartOrdersClient initialOrders={serializedOrders} customers={customers} />
      ) : (
        <InventoryTableClient initialParts={serializedParts} />
      )}
    </div>
  );
}

