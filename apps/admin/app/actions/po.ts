"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function createPurchaseOrder(supplierId: string, items: { partId?: string; partName: string; quantity: number; cost?: number; notes?: string }[]) {
  try {
    const year = new Date().getFullYear();
    const sequenceCount = await prisma.purchaseOrder.count({
      where: { orderNumber: { startsWith: `PO-${year}-` } }
    });
    const orderNumber = `PO-${year}-${String(sequenceCount + 1).padStart(4, "0")}`;

    const po = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId,
        status: "DRAFT",
        items: {
          create: items.map(i => ({
            partId: i.partId,
            partName: i.partName,
            quantity: i.quantity,
            cost: i.cost,
            notes: i.notes
          }))
        }
      }
    });

    revalidatePath("/inventory/po");
    return { success: true, po };
  } catch (error: any) {
    console.error("Failed to create PO:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePurchaseOrderStatus(id: string, status: "DRAFT" | "ORDERED" | "PARTIALLY_RECEIVED" | "DELIVERED" | "CANCELLED") {
  try {
    const po = await prisma.purchaseOrder.update({
      where: { id },
      data: { 
        status,
        orderedAt: status === "ORDERED" ? new Date() : undefined,
      }
    });
    revalidatePath("/inventory/po");
    return { success: true, po };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function receivePurchaseOrderItem(poId: string, itemId: string, receivedQuantity: number, staffId?: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const item = await tx.purchaseOrderItem.findUnique({ where: { id: itemId } });
      if (!item) throw new Error("Item not found");

      const newReceivedQty = item.receivedQuantity + receivedQuantity;
      await tx.purchaseOrderItem.update({
        where: { id: itemId },
        data: { receivedQuantity: newReceivedQty }
      });

      if (item.partId) {
        const part = await tx.part.findUnique({ where: { id: item.partId } });
        if (part) {
          const newQty = part.quantity + receivedQuantity;
          await tx.part.update({
            where: { id: item.partId },
            data: { quantity: newQty }
          });

          await tx.inventoryTransaction.create({
            data: {
              partId: item.partId,
              type: "SUPPLIER_RECEIPT",
              quantityChange: receivedQuantity,
              previousQuantity: part.quantity,
              newQuantity: newQty,
              staffId,
              purchaseOrderId: poId,
              notes: `Received ${receivedQuantity} from PO`
            }
          });
        }
      }
    });

    revalidatePath("/inventory/po");
    revalidatePath(`/inventory/po/${poId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
