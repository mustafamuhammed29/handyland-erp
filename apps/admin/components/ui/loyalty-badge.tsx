import { LoyaltyTier } from "@repo/database";

const TIER_CONFIG = {
  BRONZE: { bg: "bg-amber-100", text: "text-amber-800", icon: "🥉" },
  SILVER: { bg: "bg-gray-100", text: "text-gray-800", icon: "🥈" },
  GOLD: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "🥇" },
  VIP: { bg: "bg-purple-100", text: "text-purple-800", icon: "👑" },
};

export function LoyaltyBadge({ tier }: { tier: LoyaltyTier }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.BRONZE;
  
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      <span>{config.icon}</span>
      {tier}
    </span>
  );
}
