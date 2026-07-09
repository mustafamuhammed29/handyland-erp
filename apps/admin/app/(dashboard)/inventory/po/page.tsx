import { prisma } from "@repo/database";
import { TabSwitcher } from "../../../../components/inventory/TabSwitcher";
import { PoClient } from "../../../../components/inventory/PoClient";

export const dynamic = "force-dynamic";

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      supplier: true,
      items: true
    }
  });

  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" }});
  const parts = await prisma.part.findMany({ orderBy: { name: "asc" }});

  const serializedOrders = purchaseOrders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    orderedAt: o.orderedAt?.toISOString() ?? null,
    supplier: { id: o.supplier.id, name: o.supplier.name },
    itemsCount: o.items.length,
    totalQuantity: o.items.reduce((sum, i) => sum + i.quantity, 0),
    receivedQuantity: o.items.reduce((sum, i) => sum + i.receivedQuantity, 0),
  }));

  const serializedSuppliers = suppliers.map(s => ({ id: s.id, name: s.name }));
  const serializedParts = parts.map(p => ({ id: p.id, name: p.name, category: p.category, deviceModel: p.deviceModel }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Lieferantenbestellungen</h1>
          <p className="text-muted-foreground">Erstelle und verwalte Bestellungen bei Lieferanten (Purchase Orders).</p>
        </div>
      </div>

      <TabSwitcher />

      <PoClient initialOrders={serializedOrders} suppliers={serializedSuppliers} parts={serializedParts} />
    </div>
  );
}
