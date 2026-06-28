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

export async function updateStock(id: string, amount: number) {
  try {
    const part = await prisma.part.update({
      where: { id },
      data: {
        quantity: { increment: amount },
      },
    });
    revalidatePath("/inventory");
    return { success: true, part };
  } catch (error: any) {
    console.error("Failed to update stock:", error);
    return { success: false, error: error.message };
  }
}
