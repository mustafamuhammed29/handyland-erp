"use server";

import { prisma } from "@repo/database";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function addCustomerNote(customerId: string, note: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error("Nicht autorisiert");
    }

    await prisma.$transaction([
      prisma.customerNote.create({
        data: {
          customerId,
          staffId: session.user.id,
          note,
        },
      }),
      prisma.customer.update({
        where: { id: customerId },
        data: { updatedAt: new Date() }, // Tracks last interaction
      }),
    ]);

    revalidatePath(`/customers/${customerId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add note:", error);
    return { success: false, error: error.message };
  }
}
