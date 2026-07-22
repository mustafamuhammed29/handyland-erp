import { prisma } from "./src/index";

async function backfillInventory() {
  console.log("Starting inventory categories and device models backfill...");

  const defaultCategories = [
    "Display",
    "Akku",
    "Ladebuchse",
    "Kamera",
    "Rückabdeckung",
    "Lautsprecher",
    "Hörmuschel",
    "Mikrofon",
    "Software",
    "Zubehör",
  ];

  const defaultModels = [
    { brand: "Apple", modelName: "iPhone 11" },
    { brand: "Apple", modelName: "iPhone 12" },
    { brand: "Apple", modelName: "iPhone 13" },
    { brand: "Apple", modelName: "iPhone 13 Pro" },
    { brand: "Apple", modelName: "iPhone 14" },
    { brand: "Apple", modelName: "iPhone 14 Pro" },
    { brand: "Apple", modelName: "iPhone 15" },
    { brand: "Apple", modelName: "iPhone 15 Pro" },
    { brand: "Apple", modelName: "iPhone 16" },
    { brand: "Samsung", modelName: "Galaxy S21" },
    { brand: "Samsung", modelName: "Galaxy S22" },
    { brand: "Samsung", modelName: "Galaxy S23" },
    { brand: "Samsung", modelName: "Galaxy S24" },
  ];

  // 1. Seed default categories if missing
  for (const catName of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: { equals: catName, mode: "insensitive" } },
    });
    if (!existing) {
      await prisma.category.create({ data: { name: catName } });
    }
  }

  // 2. Seed default models if missing
  for (const model of defaultModels) {
    const existing = await prisma.deviceModel.findFirst({
      where: {
        brand: { equals: model.brand, mode: "insensitive" },
        modelName: { equals: model.modelName, mode: "insensitive" },
      },
    });
    if (!existing) {
      await prisma.deviceModel.create({
        data: { brand: model.brand, modelName: model.modelName },
      });
    }
  }

  // 3. Process existing Part records
  const parts = await prisma.part.findMany();
  console.log(`Found ${parts.length} part records to evaluate for backfill.`);

  let updatedCount = 0;

  for (const part of parts) {
    let targetCategoryId = part.categoryId;
    let targetDeviceModelId = part.deviceModelId;

    // Handle category backfill
    if (part.category && part.category.trim() !== "") {
      const trimmedCategory = part.category.trim();
      let catRecord = await prisma.category.findFirst({
        where: { name: { equals: trimmedCategory, mode: "insensitive" } },
      });

      if (!catRecord) {
        // Form canonical name (Capitalized first letter)
        const canonicalName =
          trimmedCategory.charAt(0).toUpperCase() + trimmedCategory.slice(1);
        catRecord = await prisma.category.create({
          data: { name: canonicalName },
        });
      }
      targetCategoryId = catRecord.id;
    }

    // Handle deviceModel & brand backfill
    const brandStr = part.brand?.trim() || "";
    const modelStr = part.deviceModel?.trim() || "";

    if (brandStr !== "" || modelStr !== "") {
      const effectiveBrand = brandStr || "Universal";
      const effectiveModel = modelStr || "Generisch";

      let modelRecord = await prisma.deviceModel.findFirst({
        where: {
          brand: { equals: effectiveBrand, mode: "insensitive" },
          modelName: { equals: effectiveModel, mode: "insensitive" },
        },
      });

      if (!modelRecord) {
        modelRecord = await prisma.deviceModel.create({
          data: { brand: effectiveBrand, modelName: effectiveModel },
        });
      }
      targetDeviceModelId = modelRecord.id;
    }

    // Update part if links changed
    if (targetCategoryId !== part.categoryId || targetDeviceModelId !== part.deviceModelId) {
      await prisma.part.update({
        where: { id: part.id },
        data: {
          categoryId: targetCategoryId,
          deviceModelId: targetDeviceModelId,
        },
      });
      updatedCount++;
    }
  }

  console.log(`Backfill completed successfully. ${updatedCount} parts updated with category/model relations.`);
}

backfillInventory()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
