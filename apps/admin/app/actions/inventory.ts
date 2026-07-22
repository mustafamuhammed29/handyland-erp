"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

// --- CATEGORIES ---

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { parts: true },
        },
      },
    });
    return {
      success: true,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        partsCount: c._count.parts,
        createdAt: c.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error("Failed to fetch categories:", error);
    return { success: false, error: error.message, categories: [] };
  }
}

export async function createCategory(name: string) {
  try {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, error: "Name ist erforderlich." };

    const existing = await prisma.category.findFirst({
      where: { name: { equals: trimmed, mode: "insensitive" } },
    });
    if (existing) {
      return { success: false, error: `Kategorie "${existing.name}" existiert bereits.`, category: existing };
    }

    const category = await prisma.category.create({
      data: { name: trimmed },
    });
    revalidatePath("/inventory");
    revalidatePath("/inventory/settings");
    return { success: true, category };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCategory(id: string, name: string) {
  try {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, error: "Name ist erforderlich." };

    const existing = await prisma.category.findFirst({
      where: {
        id: { not: id },
        name: { equals: trimmed, mode: "insensitive" },
      },
    });
    if (existing) {
      return { success: false, error: `Eine andere Kategorie mit dem Namen "${existing.name}" existiert bereits.` };
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name: trimmed },
    });

    // Sync string field on parts
    await prisma.part.updateMany({
      where: { categoryId: id },
      data: { category: trimmed },
    });

    revalidatePath("/inventory");
    revalidatePath("/inventory/settings");
    return { success: true, category };
  } catch (error: any) {
    console.error("Failed to update category:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    const partsCount = await prisma.part.count({ where: { categoryId: id } });
    if (partsCount > 0) {
      return {
        success: false,
        error: `Kategorie kann nicht gelöscht werden, da sie noch von ${partsCount} Teil(en) verwendet wird.`,
      };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/inventory");
    revalidatePath("/inventory/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return { success: false, error: error.message };
  }
}

// --- DEVICE MODELS ---

export async function getDeviceModels() {
  try {
    const deviceModels = await prisma.deviceModel.findMany({
      orderBy: [{ brand: "asc" }, { modelName: "asc" }],
      include: {
        _count: {
          select: { parts: true },
        },
      },
    });
    return {
      success: true,
      deviceModels: deviceModels.map((m) => ({
        id: m.id,
        brand: m.brand,
        modelName: m.modelName,
        partsCount: m._count.parts,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error("Failed to fetch device models:", error);
    return { success: false, error: error.message, deviceModels: [] };
  }
}

export async function createDeviceModel(brand: string, modelName: string) {
  try {
    const trimmedBrand = brand.trim();
    const trimmedModel = modelName.trim();

    if (!trimmedBrand || !trimmedModel) {
      return { success: false, error: "Marke und Modellname sind erforderlich." };
    }

    const existing = await prisma.deviceModel.findFirst({
      where: {
        brand: { equals: trimmedBrand, mode: "insensitive" },
        modelName: { equals: trimmedModel, mode: "insensitive" },
      },
    });
    if (existing) {
      return {
        success: false,
        error: `Modell "${existing.brand} ${existing.modelName}" existiert bereits.`,
        deviceModel: existing,
      };
    }

    const deviceModel = await prisma.deviceModel.create({
      data: { brand: trimmedBrand, modelName: trimmedModel },
    });
    revalidatePath("/inventory");
    revalidatePath("/inventory/settings");
    return { success: true, deviceModel };
  } catch (error: any) {
    console.error("Failed to create device model:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDeviceModel(id: string) {
  try {
    const partsCount = await prisma.part.count({ where: { deviceModelId: id } });
    if (partsCount > 0) {
      return {
        success: false,
        error: `Gerätemodell kann nicht gelöscht werden, da es noch von ${partsCount} Teil(en) verwendet wird.`,
      };
    }

    await prisma.deviceModel.delete({ where: { id } });
    revalidatePath("/inventory");
    revalidatePath("/inventory/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete device model:", error);
    return { success: false, error: error.message };
  }
}

// --- PART CRUD & STOCK-IN ---

export async function createPart(data: any) {
  try {
    let categoryName = data.category || null;
    if (data.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (cat) categoryName = cat.name;
    }

    let brandStr = data.brand || null;
    let deviceModelStr = data.deviceModel || null;
    if (data.deviceModelId) {
      const dm = await prisma.deviceModel.findUnique({ where: { id: data.deviceModelId } });
      if (dm) {
        brandStr = dm.brand;
        deviceModelStr = dm.modelName;
      }
    }

    const part = await prisma.part.create({
      data: {
        name: data.name,
        categoryId: data.categoryId || null,
        category: categoryName,
        sku: data.sku || null,
        brand: brandStr,
        deviceModel: deviceModelStr,
        deviceModelId: data.deviceModelId || null,
        quality: data.quality || null,
        color: data.color || null,
        quantity: parseInt(data.quantity) || 0,
        minQuantity: parseInt(data.minQuantity) || 5,
        price: data.price,
        cost: data.cost || null,
        location: data.location || null,
        supplierId: data.supplierId || null,
      },
    });
    revalidatePath("/inventory");
    return { success: true, part };
  } catch (error: any) {
    console.error("Failed to create part:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePart(id: string, data: any) {
  try {
    let categoryName = data.category || null;
    if (data.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (cat) categoryName = cat.name;
    }

    let brandStr = data.brand || null;
    let deviceModelStr = data.deviceModel || null;
    if (data.deviceModelId) {
      const dm = await prisma.deviceModel.findUnique({ where: { id: data.deviceModelId } });
      if (dm) {
        brandStr = dm.brand;
        deviceModelStr = dm.modelName;
      }
    }

    const part = await prisma.part.update({
      where: { id },
      data: {
        name: data.name,
        categoryId: data.categoryId || null,
        category: categoryName,
        sku: data.sku || null,
        brand: brandStr,
        deviceModel: deviceModelStr,
        deviceModelId: data.deviceModelId || null,
        quality: data.quality || null,
        color: data.color || null,
        quantity: parseInt(data.quantity) || 0,
        minQuantity: parseInt(data.minQuantity) || 5,
        price: data.price,
        cost: data.cost || null,
        location: data.location || null,
        supplierId: data.supplierId || null,
      },
    });
    revalidatePath("/inventory");
    return { success: true, part };
  } catch (error: any) {
    console.error("Failed to update part:", error);
    return { success: false, error: error.message };
  }
}

export async function addStockIn(data: {
  partId?: string;
  newPartData?: {
    name: string;
    categoryId?: string;
    category?: string;
    sku?: string;
    brand?: string;
    deviceModelId?: string;
    deviceModel?: string;
    minQuantity?: number;
    price: string | number;
    cost?: string | number;
    location?: string;
  };
  quantity: number;
  unitCost?: string | number;
  supplierId?: string;
  supplierName?: string;
  notes?: string;
  staffId?: string;
}) {
  try {
    const qty = parseInt(String(data.quantity)) || 0;
    if (qty <= 0) {
      return { success: false, error: "Die Menge muss größer als 0 sein." };
    }

    return await prisma.$transaction(async (tx) => {
      let finalSupplierId = data.supplierId || null;

      // Handle free-text supplier name if no supplierId
      if (!finalSupplierId && data.supplierName && data.supplierName.trim() !== "") {
        const supName = data.supplierName.trim();
        let sup = await tx.supplier.findFirst({
          where: { name: { equals: supName, mode: "insensitive" } },
        });
        if (!sup) {
          sup = await tx.supplier.create({
            data: { name: supName },
          });
        }
        finalSupplierId = sup.id;
      }

      let targetPartId = data.partId;
      let prevQty = 0;
      let newQty = qty;
      let partName = "";

      if (targetPartId) {
        // Stock-in existing part
        const existingPart = await tx.part.findUnique({ where: { id: targetPartId } });
        if (!existingPart) throw new Error("Teil nicht gefunden.");

        prevQty = existingPart.quantity;
        newQty = prevQty + qty;
        partName = existingPart.name;

        await tx.part.update({
          where: { id: targetPartId },
          data: {
            quantity: newQty,
            cost: data.unitCost != null && String(data.unitCost) !== "" ? data.unitCost : existingPart.cost,
            supplierId: finalSupplierId ?? existingPart.supplierId,
          },
        });
      } else if (data.newPartData) {
        // Register new part and stock-in
        let categoryName = data.newPartData.category || null;
        if (data.newPartData.categoryId) {
          const cat = await tx.category.findUnique({ where: { id: data.newPartData.categoryId } });
          if (cat) categoryName = cat.name;
        }

        let brandStr = data.newPartData.brand || null;
        let deviceModelStr = data.newPartData.deviceModel || null;
        if (data.newPartData.deviceModelId) {
          const dm = await tx.deviceModel.findUnique({ where: { id: data.newPartData.deviceModelId } });
          if (dm) {
            brandStr = dm.brand;
            deviceModelStr = dm.modelName;
          }
        }

        const newPart = await tx.part.create({
          data: {
            name: data.newPartData.name,
            categoryId: data.newPartData.categoryId || null,
            category: categoryName,
            sku: data.newPartData.sku || null,
            brand: brandStr,
            deviceModel: deviceModelStr,
            deviceModelId: data.newPartData.deviceModelId || null,
            quantity: qty,
            minQuantity: data.newPartData.minQuantity || 5,
            price: data.newPartData.price,
            cost: data.unitCost != null ? data.unitCost : (data.newPartData.cost || null),
            location: data.newPartData.location || null,
            supplierId: finalSupplierId,
          },
        });

        targetPartId = newPart.id;
        prevQty = 0;
        newQty = qty;
        partName = newPart.name;
      } else {
        throw new Error("Weder Part-ID noch neue Teildaten angegeben.");
      }

      // Create InventoryTransaction of type PURCHASE
      await tx.inventoryTransaction.create({
        data: {
          partId: targetPartId,
          type: "PURCHASE",
          quantityChange: qty,
          previousQuantity: prevQty,
          newQuantity: newQty,
          staffId: data.staffId || null,
          notes: data.notes ? `Wareneingang: ${data.notes}` : `Wareneingang (+${qty})`,
        },
      });

      return { success: true, partId: targetPartId, partName, newQuantity: newQty };
    });
  } catch (error: any) {
    console.error("Failed to add stock-in:", error);
    return { success: false, error: error.message };
  } finally {
    revalidatePath("/inventory");
    revalidatePath("/inventory/settings");
  }
}

export async function deleteParts(ids: string[]) {
  try {
    await prisma.part.deleteMany({
      where: { id: { in: ids } },
    });
    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete parts:", error);
    return { success: false, error: error.message };
  }
}

export async function updateStock(id: string, amount: number, staffId?: string, notes?: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const part = await tx.part.findUnique({ where: { id } });
      if (!part) throw new Error("Part not found");

      const newQuantity = part.quantity + amount;

      const updatedPart = await tx.part.update({
        where: { id },
        data: { quantity: newQuantity },
      });

      await tx.inventoryTransaction.create({
        data: {
          partId: id,
          type: "MANUAL_ADJUSTMENT",
          quantityChange: amount,
          previousQuantity: part.quantity,
          newQuantity: newQuantity,
          staffId,
          notes: notes || "Manual stock adjustment",
        },
      });

      return { success: true, part: updatedPart };
    });
  } catch (error: any) {
    console.error("Failed to update stock:", error);
    return { success: false, error: error.message };
  } finally {
    revalidatePath("/inventory");
  }
}

export async function processDirectSale(items: { partId: string; quantity: number; price: number }[], staffId?: string) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const part = await tx.part.findUnique({ where: { id: item.partId } });
        if (!part) throw new Error(`Part ${item.partId} not found`);
        if (part.quantity < item.quantity) throw new Error(`Not enough stock for ${part.name}`);

        const newQuantity = part.quantity - item.quantity;

        await tx.part.update({
          where: { id: item.partId },
          data: { quantity: newQuantity },
        });

        await tx.inventoryTransaction.create({
          data: {
            partId: item.partId,
            type: "DIRECT_SALE",
            quantityChange: -item.quantity,
            previousQuantity: part.quantity,
            newQuantity: newQuantity,
            staffId,
            notes: `Direct sale at €${item.price} each`,
          },
        });
      }
    });
    revalidatePath("/inventory");
    revalidatePath("/pos");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to process direct sale:", error);
    return { success: false, error: error.message };
  }
}
