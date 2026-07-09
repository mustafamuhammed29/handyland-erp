import { LoyaltyTier, PrismaClient } from "@prisma/client";

// In a real application, you might export the shared prisma client, 
// but we will use the one exported from @repo/database
import { prisma } from "./index";

const TIER_THRESHOLDS = {
  BRONZE: { spending: 0, points: 0 },
  SILVER: { spending: 500, points: 100 },
  GOLD: { spending: 1500, points: 300 },
  VIP: { spending: 3000, points: 600 },
};

export function calculateLoyaltyTier(
  totalSpending: number,
  loyaltyPoints: number
): LoyaltyTier {
  if (totalSpending >= TIER_THRESHOLDS.VIP.spending) return "VIP";
  if (totalSpending >= TIER_THRESHOLDS.GOLD.spending) return "GOLD";
  if (totalSpending >= TIER_THRESHOLDS.SILVER.spending) return "SILVER";
  return "BRONZE";
}

export function calculateLoyaltyPoints(repairPrice: number): number {
  // 1 point per €10 spent
  return Math.floor(repairPrice / 10);
}

export async function updateCustomerLoyalty(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) return;

  const newTier = calculateLoyaltyTier(
    Number(customer.totalSpending),
    customer.loyaltyPoints
  );

  if (newTier !== customer.loyaltyTier) {
    await prisma.customer.update({
      where: { id: customerId },
      data: { loyaltyTier: newTier },
    });

    console.log(`🎉 Customer ${customerId} upgraded to ${newTier}!`);
  }
}
