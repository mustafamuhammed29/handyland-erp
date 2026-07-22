import { prisma } from "@repo/database";
import { TabSwitcher } from "../../../../components/inventory/TabSwitcher";
import { CategoryDeviceSettingsClient } from "../../../../components/inventory/CategoryDeviceSettingsClient";

export const dynamic = "force-dynamic";

export default async function InventorySettingsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { deviceModels: true },
      },
    },
  });

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
      brandRel: true,
      _count: {
        select: { parts: true },
      },
    },
  });

  const serializedBrands = brands.map((b) => ({
    id: b.id,
    name: b.name,
    modelsCount: b._count.deviceModels,
  }));

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    partsCount: c._count.parts,
  }));

  const serializedDeviceModels = deviceModels.map((m) => ({
    id: m.id,
    brand: m.brandRel ? m.brandRel.name : m.brand,
    brandId: m.brandId || null,
    modelName: m.modelName,
    partsCount: m._count.parts,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Inventar & Einstellungen</h1>
        <p className="text-muted-foreground">Marken, Gerätemodelle und Ersatzteil-Kategorien verwalten.</p>
      </div>

      {/* Tab Switcher */}
      <TabSwitcher />

      {/* Settings Client Component */}
      <CategoryDeviceSettingsClient
        initialBrands={serializedBrands}
        initialCategories={serializedCategories}
        initialDeviceModels={serializedDeviceModels}
      />
    </div>
  );
}
