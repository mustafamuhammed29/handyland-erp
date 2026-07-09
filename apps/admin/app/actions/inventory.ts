"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function createPart(data: any) {
  try {
    const part = await prisma.part.create({
      data: {
        name: data.name,
        category: data.category || null,
        sku: data.sku || null,
        quantity: parseInt(data.quantity) || 0,
        minQuantity: parseInt(data.minQuantity) || 5,
        price: data.price,
        cost: data.cost || null,
        location: data.location || null,
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
    const part = await prisma.part.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category || null,
        sku: data.sku || null,
        quantity: parseInt(data.quantity) || 0,
        minQuantity: parseInt(data.minQuantity) || 5,
        price: data.price,
        cost: data.cost || null,
        location: data.location || null,
      },
    });
    revalidatePath("/inventory");
    return { success: true, part };
  } catch (error: any) {
    console.error("Failed to update part:", error);
    return { success: false, error: error.message };
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
        }
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

export async function processDirectSale(items: { partId: string, quantity: number, price: number }[], staffId?: string) {
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
          }
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
