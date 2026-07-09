"use server";

import { prisma, LoyaltyTier } from "@repo/database";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./../api/auth/[...nextauth]/route";

export async function addCustomerNote(customerId: string, note: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Nicht autorisiert.");

    const newNote = await prisma.customerNote.create({
      data: {
        customerId,
        note,
        staffId: session.user.id
      }
    });

    revalidatePath(`/customers/${customerId}`);
    return { success: true, note: newNote };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomerNote(noteId: string, customerId: string) {
  try {
    await prisma.customerNote.delete({
      where: { id: noteId }
    });

    revalidatePath(`/customers/${customerId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCustomerConsent(customerId: string, gdprConsent: boolean, marketingConsent: boolean) {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: customerId }});
    if (!customer) throw new Error("Kunde nicht gefunden");

    const data: any = {
      gdprConsent,
      marketingConsent
    };

    if (gdprConsent && !customer.gdprConsent) {
      data.gdprConsentAt = new Date();
    } else if (!gdprConsent) {
      data.gdprConsentAt = null;
    }

    if (marketingConsent && !customer.marketingConsent) {
      data.marketingConsentAt = new Date();
    } else if (!marketingConsent) {
      data.marketingConsentAt = null;
    }

    await prisma.customer.update({
      where: { id: customerId },
      data
    });

    revalidatePath(`/customers/${customerId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function recalculateCustomerSpending(customerId: string) {
  try {
    // Recalculate spending from delivered repairs
    const repairs = await prisma.repair.findMany({
      where: { customerId, status: "DELIVERED" }
    });

    const totalSpending = repairs.reduce((acc, r) => acc + (r.finalPrice ? Number(r.finalPrice) : 0), 0);
    const totalRepairs = repairs.length;

    // Basic logic for loyalty tiers:
    // BRONZE: < 500, SILVER: >= 500, GOLD: >= 1000, VIP: >= 2000
    let loyaltyTier: LoyaltyTier = "BRONZE";
    if (totalSpending >= 2000) loyaltyTier = "VIP";
    else if (totalSpending >= 1000) loyaltyTier = "GOLD";
    else if (totalSpending >= 500) loyaltyTier = "SILVER";

    // Update customer
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        totalSpending,
        totalRepairs,
        loyaltyTier
      }
    });

    revalidatePath(`/customers/${customerId}`);
    return { success: true, totalSpending, loyaltyTier, totalRepairs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
