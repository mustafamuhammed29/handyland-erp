"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function createSupplier(data: { name: string; phone?: string; email?: string; website?: string; address?: string; notes?: string }) {
  try {
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        address: data.address || null,
        notes: data.notes || null,
      },
    });
    revalidatePath("/inventory/suppliers");
    return { success: true, supplier };
  } catch (error: any) {
    console.error("Failed to create supplier:", error);
    return { success: false, error: error.message };
  }
}

export async function updateSupplier(id: string, data: { name: string; phone?: string; email?: string; website?: string; address?: string; notes?: string }) {
  try {
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        address: data.address || null,
        notes: data.notes || null,
      },
    });
    revalidatePath("/inventory/suppliers");
    return { success: true, supplier };
  } catch (error: any) {
    console.error("Failed to update supplier:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteSuppliers(ids: string[]) {
  try {
    await prisma.supplier.deleteMany({
      where: { id: { in: ids } },
    });
    revalidatePath("/inventory/suppliers");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete suppliers:", error);
    return { success: false, error: error.message };
  }
}
