"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function deleteCustomer(customerId: string) {
  try {
    // Check if customer has repairs
    const repairCount = await prisma.repair.count({
      where: { customerId },
    });

    if (repairCount > 0) {
      return { success: false, error: "Kunde kann nicht gelöscht werden, da er noch Reparaturen hat." };
    }

    // Delete related customer notes
    await prisma.customerNote.deleteMany({ where: { customerId } });

    // Delete related devices (since they don't have repairs, it's safe)
    await prisma.device.deleteMany({ where: { customerId } });

    await prisma.customer.delete({
      where: { id: customerId },
    });

    revalidatePath(`/customers`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete customer:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCustomers(customerIds: string[]) {
  try {
    // Check if any of these customers have repairs
    const repairCount = await prisma.repair.count({
      where: { customerId: { in: customerIds } },
    });

    if (repairCount > 0) {
      return { success: false, error: "Einige der ausgewählten Kunden haben noch Reparaturen und können nicht gelöscht werden." };
    }

    // Delete related customer notes
    await prisma.customerNote.deleteMany({ where: { customerId: { in: customerIds } } });

    // Delete related devices
    await prisma.device.deleteMany({ where: { customerId: { in: customerIds } } });

    await prisma.customer.deleteMany({
      where: { id: { in: customerIds } },
    });

    revalidatePath(`/customers`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete customers:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCustomer(customerId: string, data: any) {
  try {
    await prisma.customer.update({
      where: { id: customerId },
      data,
    });
    revalidatePath(`/customers`);
    revalidatePath(`/customers/${customerId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update customer:", error);
    return { success: false, error: error.message };
  }
}
