"use server";

import { prisma, RepairStatus } from "@repo/database";
import { revalidatePath } from "next/cache";

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
