"use server";

import { prisma, RepairStatus, updateCustomerLoyalty, calculateLoyaltyPoints } from "@repo/database";
import { revalidatePath as originalRevalidatePath } from "next/cache";

function revalidatePath(path: string) {
  try {
    originalRevalidatePath(path);
  } catch {
    // Ignore store error when running outside Next.js request context
  }
}

export async function updateRepairStatus(repairId: string, newStatus: RepairStatus) {
  try {
    await prisma.repair.update({
      where: { id: repairId },
      data: { status: newStatus },
    });
    
    // Log history
    await prisma.repairStatusHistory.create({
      data: {
        repairId,
        status: newStatus,
        note: "Status updated from Admin Dashboard",
      }
    });

    revalidatePath(`/repairs/${repairId}`);
    revalidatePath(`/repairs`);
    revalidatePath(`/dashboard`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update status:", error);
    return { success: false, error: error.message };
  }
}

export async function updateRepairPrice(repairId: string, estimatedPrice: number, pickupDate: string | null) {
  try {
    await prisma.repair.update({
      where: { id: repairId },
      data: { 
        estimatedPrice,
        pickupDate: pickupDate ? new Date(pickupDate) : null,
      },
    });

    revalidatePath(`/repairs/${repairId}`);
    revalidatePath(`/repairs`);
    revalidatePath(`/dashboard`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update price:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteRepair(repairId: string) {
  try {
    // Delete related records without Cascade
    await prisma.repairStatusHistory.deleteMany({ where: { repairId } });
    await prisma.repairNote.deleteMany({ where: { repairId } });

    await prisma.repair.delete({
      where: { id: repairId },
    });

    revalidatePath(`/repairs`);
    revalidatePath(`/dashboard`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete repair:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteRepairs(repairIds: string[]) {
  try {
    // Delete related records without Cascade
    await prisma.repairStatusHistory.deleteMany({ where: { repairId: { in: repairIds } } });
    await prisma.repairNote.deleteMany({ where: { repairId: { in: repairIds } } });

    await prisma.repair.deleteMany({
      where: { id: { in: repairIds } },
    });

    revalidatePath(`/repairs`);
    revalidatePath(`/dashboard`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete repairs:", error);
    return { success: false, error: error.message };
  }
}

export async function addPartToRepair(repairId: string, partId: string, quantity: number, staffId?: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const part = await tx.part.findUnique({ where: { id: partId } });
      if (!part) throw new Error("Part not found");
      if (part.quantity < quantity) throw new Error("Not enough stock available");

      const newQty = part.quantity - quantity;
      
      await tx.part.update({
        where: { id: partId },
        data: { quantity: newQty }
      });

      const repairPart = await tx.repairPart.create({
        data: {
          repairId,
          partId,
          quantity,
          price: part.price,
          cost: part.cost
        }
      });

      await tx.inventoryTransaction.create({
        data: {
          partId,
          type: "REPAIR_CONSUMPTION",
          quantityChange: -quantity,
          previousQuantity: part.quantity,
          newQuantity: newQty,
          staffId,
          repairId,
          notes: `Added to repair ticket`
        }
      });

      return { success: true, repairPart };
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    revalidatePath(`/repairs/${repairId}`);
  }
}

export async function removePartFromRepair(repairPartId: string, staffId?: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const repairPart = await tx.repairPart.findUnique({ where: { id: repairPartId }, include: { part: true } });
      if (!repairPart) throw new Error("Repair part not found");

      const newQty = repairPart.part.quantity + repairPart.quantity;

      await tx.part.update({
        where: { id: repairPart.partId },
        data: { quantity: newQty }
      });

      await tx.repairPart.delete({ where: { id: repairPartId } });

      await tx.inventoryTransaction.create({
        data: {
          partId: repairPart.partId,
          type: "RETURN_TO_STOCK",
          quantityChange: repairPart.quantity,
          previousQuantity: repairPart.part.quantity,
          newQuantity: newQty,
          staffId,
          repairId: repairPart.repairId,
          notes: `Removed from repair ticket`
        }
      });

      return { success: true };
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    // Note: since we don't have repairId easily available outside tx we rely on the component or caller to refresh
  }
}

export async function updateRepairPartQuantity(repairPartId: string, newQuantity: number, staffId?: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const repairPart = await tx.repairPart.findUnique({ where: { id: repairPartId }, include: { part: true } });
      if (!repairPart) throw new Error("Repair part not found");

      const delta = newQuantity - repairPart.quantity;
      if (delta === 0) return { success: true }; // No change

      if (repairPart.part.quantity < delta) {
        throw new Error("Not enough stock available for this increase");
      }

      const newStockQty = repairPart.part.quantity - delta;

      // Update part stock
      await tx.part.update({
        where: { id: repairPart.partId },
        data: { quantity: newStockQty }
      });

      // Update repair part
      await tx.repairPart.update({
        where: { id: repairPartId },
        data: { quantity: newQuantity }
      });

      // Log transaction
      await tx.inventoryTransaction.create({
        data: {
          partId: repairPart.partId,
          type: delta > 0 ? "REPAIR_CONSUMPTION" : "RETURN_TO_STOCK",
          quantityChange: -delta,
          previousQuantity: repairPart.part.quantity,
          newQuantity: newStockQty,
          staffId,
          repairId: repairPart.repairId,
          notes: `Updated quantity in repair ticket from ${repairPart.quantity} to ${newQuantity}`
        }
      });

      return { success: true };
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function completeRepair(repairId: string, finalPrice: number) {
  try {
    const repair = await prisma.repair.update({
      where: { id: repairId },
      data: {
        status: "DELIVERED",
        finalPrice,
        customer: {
          update: {
            totalSpending: {
              increment: finalPrice,
            },
            totalRepairs: {
              increment: 1,
            },
            loyaltyPoints: {
              increment: calculateLoyaltyPoints(finalPrice),
            },
          },
        },
      },
      include: { customer: true },
    });

    // Check if customer should be upgraded
    await updateCustomerLoyalty(repair.customerId);

    revalidatePath(`/repairs/${repairId}`);
    revalidatePath(`/repairs`);
    revalidatePath(`/dashboard`);
    revalidatePath(`/customers/${repair.customerId}`);
    
    return { success: true, repair };
  } catch (error: any) {
    console.error("Failed to complete repair:", error);
    return { success: false, error: error.message };
  }
}
