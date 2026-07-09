import { prisma } from "@repo/database";
import { TabSwitcher } from "../../../../components/inventory/TabSwitcher";
import { SuppliersClient } from "../../../../components/inventory/SuppliersClient";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });

  const serializedSuppliers = suppliers.map(s => ({
    id: s.id,
    name: s.name,
    phone: s.phone ?? null,
    email: s.email ?? null,
    website: s.website ?? null,
    address: s.address ?? null,
    notes: s.notes ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Lieferanten</h1>
          <p className="text-muted-foreground">Verwalte hier alle Lieferanten für Ersatzteile.</p>
        </div>
      </div>

      <TabSwitcher />

      <SuppliersClient initialSuppliers={serializedSuppliers} />
    </div>
  );
}
