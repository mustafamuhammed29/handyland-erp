import { prisma } from "./src/index";

async function backfillBrands() {
  console.log("=== STARTING BRAND BACKFILL & MIGRATION ===");

  try {
    // 1. Fetch all DeviceModels
    const deviceModels = await prisma.deviceModel.findMany();
    console.log(`Found ${deviceModels.length} existing DeviceModel record(s).`);

    // Map of normalized name (lowercase) -> canonical brand name
    const brandMap = new Map<string, string>();

    // Default standard brands to seed if not already present
    const defaultBrands = ["Apple", "Samsung", "Google", "Huawei", "Xiaomi", "Sony", "OnePlus"];
    for (const b of defaultBrands) {
      brandMap.set(b.toLowerCase(), b);
    }

    // Extract brands from existing DeviceModels
    for (const dm of deviceModels) {
      if (dm.brand && dm.brand.trim() !== "") {
        const trimmed = dm.brand.trim();
        const key = trimmed.toLowerCase();
        if (!brandMap.has(key)) {
          brandMap.set(key, trimmed);
        }
      }
    }

    console.log(`Identified ${brandMap.size} unique brand(s) to populate.`);

    // 2. Create Brand records
    const brandIdMap = new Map<string, string>(); // lowercase -> brandId

    for (const [key, canonicalName] of brandMap.entries()) {
      let brand = await prisma.brand.findFirst({
        where: { name: { equals: canonicalName, mode: "insensitive" } },
      });

      if (!brand) {
        brand = await prisma.brand.create({
          data: { name: canonicalName },
        });
        console.log(`Created Brand: "${brand.name}" (ID: ${brand.id})`);
      } else {
        console.log(`Brand already exists: "${brand.name}" (ID: ${brand.id})`);
      }

      brandIdMap.set(key, brand.id);
    }

    // 3. Link DeviceModel.brandId for all existing DeviceModels
    let linkedCount = 0;
    for (const dm of deviceModels) {
      if (dm.brand && dm.brand.trim() !== "") {
        const key = dm.brand.trim().toLowerCase();
        const brandId = brandIdMap.get(key);

        if (brandId && dm.brandId !== brandId) {
          await prisma.deviceModel.update({
            where: { id: dm.id },
            data: { brandId },
          });
          linkedCount++;
        }
      }
    }

    console.log(`Linked ${linkedCount} DeviceModel record(s) to Brand entities.`);
    console.log("=== BRAND BACKFILL COMPLETED SUCCESSFULLY ===");
  } catch (err) {
    console.error("Backfill failed:", err);
  }
}

backfillBrands()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
