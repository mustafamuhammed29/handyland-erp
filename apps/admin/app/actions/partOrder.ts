"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export type PartOrderData = {
  customerId: string;
  partName: string;
  description?: string;
  estimatedPrice?: string;
  notes?: string;
};

export async function createPartOrder(data: PartOrderData) {
  try {
    const order = await prisma.partOrder.create({
      data: {
        customerId: data.customerId,
        partName: data.partName,
        description: data.description || null,
        estimatedPrice: data.estimatedPrice ? parseFloat(data.estimatedPrice) : null,
        notes: data.notes || null,
        status: "PENDING",
      },
    });
    revalidatePath("/inventory");
    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePartOrderStatus(
  id: string,
  status: "PENDING" | "ORDERED" | "ARRIVED" | "NOTIFIED" | "COMPLETED" | "CANCELLED"
) {
  try {
    const data: any = { status };
    if (status === "ORDERED") data.orderedAt = new Date();
    if (status === "ARRIVED") data.arrivedAt = new Date();

    await prisma.partOrder.update({ where: { id }, data });
    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePartOrders(ids: string[]) {
  try {
    await prisma.partOrder.deleteMany({ where: { id: { in: ids } } });
    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePartOrderNotes(id: string, notes: string) {
  try {
    await prisma.partOrder.update({ where: { id }, data: { notes } });
    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
