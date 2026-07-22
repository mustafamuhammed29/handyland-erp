import { prisma } from "@repo/database";
import { TabSwitcher } from "../../../../components/inventory/TabSwitcher";
import { CategoryDeviceSettingsClient } from "../../../../components/inventory/CategoryDeviceSettingsClient";

export const dynamic = "force-dynamic";

export default async function InventorySettingsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { parts: true },
      },
    },
  });

  const deviceModels = await prisma.deviceModel.findMany({
    orderBy: [{ brand: "asc" }, { modelName: "asc" }],
    include: {
      _count: {
        select: { parts: true },
      },
    },
  });

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    partsCount: c._count.parts,
  }));

  const serializedDeviceModels = deviceModels.map((m) => ({
    id: m.id,
    brand: m.brand,
    modelName: m.modelName,
    partsCount: m._count.parts,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Inventar & Einstellungen</h1>
        <p className="text-muted-foreground">Ersatzteil-Kategorien und Gerätemodelle verwalten.</p>
      </div>

      {/* Tab Switcher */}
      <TabSwitcher />

      {/* Settings Client Component */}
      <CategoryDeviceSettingsClient
        initialCategories={serializedCategories}
        initialDeviceModels={serializedDeviceModels}
      />
    </div>
  );
}
