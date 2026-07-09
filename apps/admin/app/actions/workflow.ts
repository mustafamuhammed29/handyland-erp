"use server";

import { prisma, RepairStatus } from "@repo/database";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";

export async function updateRepairStatus(repairId: string, status: RepairStatus, note?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Nicht autorisiert.");

    // The transaction ensures the audit log, status history, and the repair are updated simultaneously
    await prisma.$transaction(async (tx) => {
      
      const currentRepair = await tx.repair.findUnique({ where: { id: repairId } });
      if (!currentRepair) throw new Error("Reparatur nicht gefunden.");

      if (currentRepair.status !== status) {
        // Update Repair
        await tx.repair.update({
          where: { id: repairId },
          data: { status }
        });

        // Add to Status History
        await tx.repairStatusHistory.create({
          data: {
            repairId,
            status,
            staffId: session.user.id,
            note: note || `Verschoben zu ${status}`
          }
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            staffId: session.user.id,
            action: "UPDATE_STATUS",
            entity: "Repair",
            entityId: repairId,
            details: { from: currentRepair.status, to: status }
          }
        });
      }
    });

    revalidatePath("/repairs");
    revalidatePath("/repairs/board");
    revalidatePath(`/repairs/${repairId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function assignTechnician(repairId: string, technicianId: string | null) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Nicht autorisiert.");

    await prisma.repair.update({
      where: { id: repairId },
      data: { assignedToId: technicianId }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        staffId: session.user.id,
        action: "ASSIGN_TECHNICIAN",
        entity: "Repair",
        entityId: repairId,
        details: { assignedTo: technicianId }
      }
    });

    revalidatePath("/repairs");
    revalidatePath("/repairs/board");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
