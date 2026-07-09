"use server";

import { prisma } from "@repo/database";

export async function getPartTransactions(partId: string) {
  try {
    const transactions = await prisma.inventoryTransaction.findMany({
      where: { partId },
      orderBy: { createdAt: "desc" },
      include: {
        staff: { select: { name: true } },
        repair: { select: { ticketNumber: true } },
        purchaseOrder: { select: { orderNumber: true } },
      },
      take: 50,
    });
    
    return { 
      success: true, 
      transactions: transactions.map(t => ({
        id: t.id,
        createdAt: t.createdAt.toISOString(),
        type: t.type,
        quantityChange: t.quantityChange,
        previousQuantity: t.previousQuantity,
        newQuantity: t.newQuantity,
        notes: t.notes,
        staffName: t.staff?.name || "System",
        reference: t.repair?.ticketNumber || t.purchaseOrder?.orderNumber || null,
      }))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
