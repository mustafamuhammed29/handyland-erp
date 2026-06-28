import { NextResponse } from "next/server";
import { prisma, IssueType, ConditionType, normalizePhone, calculateLoyaltyTier } from "@repo/database";

// Define mappings to enums
const mapIssueType = (issue: string): IssueType => {
  const map: Record<string, IssueType> = {
    DISPLAY: "DISPLAY",
    BATTERY: "BATTERY",
    CHARGING_PORT: "CHARGING_PORT",
    SPEAKER: "SPEAKER",
    EARPIECE: "EARPIECE",
    MICROPHONE: "MICROPHONE",
    CAMERA: "CAMERA",
    WATER_DAMAGE: "WATER_DAMAGE",
    BACK_COVER: "BACK_COVER",
    SOFTWARE: "SOFTWARE",
    UNLOCKING: "UNLOCKING",
    DATA_RECOVERY: "DATA_RECOVERY",
    OTHER: "OTHER",
  };
  return map[issue] || "OTHER";
};

const mapConditionType = (condition: string): ConditionType => {
  const map: Record<string, ConditionType> = {
    SCREEN_SCRATCHES: "SCREEN_SCRATCHES",
    CRACKED_SCREEN: "CRACKED_SCREEN",
    BENT_FRAME: "BENT_FRAME",
    BROKEN_CAMERA_GLASS: "BROKEN_CAMERA_GLASS",
    WATER_DAMAGE_VISIBLE: "WATER_DAMAGE_VISIBLE",
    BACK_COVER_DAMAGED: "BACK_COVER_DAMAGED",
    OTHER: "OTHER",
  };
  return map[condition] || "OTHER";
};

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. Find or create customer
    const normalizedPhone = normalizePhone(data.customer.phone);
    
    let customer = await prisma.customer.upsert({
      where: { phone: normalizedPhone },
      update: {
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        email: data.customer.email || null,
      },
      create: {
        phone: normalizedPhone,
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        email: data.customer.email || null,
      },
    });

    if (!customer || !customer.id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // 2. Create device
    const device = await prisma.device.create({
      data: {
        customerId: customer.id,
        manufacturer: data.device.brand,
        model: data.device.model,
        imei: data.device.imei,
      },
    });

    // 3. Generate Ticket Number
    const currentYear = new Date().getFullYear();
    const sequence = await prisma.ticketSequence.upsert({
      where: { year: currentYear },
      update: { lastSequence: { increment: 1 } },
      create: { year: currentYear, lastSequence: 1 },
    });
    const ticketNumber = `HL-${currentYear}-${String(sequence.lastSequence).padStart(6, "0")}`;

    // 4. Create repair
    const repair = await prisma.repair.create({
      data: {
        ticketNumber,
        ticketYear: currentYear,
        ticketSequence: sequence.lastSequence,
        customerId: customer.id,
        deviceId: device.id,
        devicePasswordEncrypted: data.security.devicePassword || null,
        devicePatternEncrypted: data.security.pattern && data.security.pattern.length > 0 ? data.security.pattern.join(",") : null,
        simPinEncrypted: data.security.simPin || null,
        hasSimCard: data.accessories.simCard,
        hasCase: data.accessories.case,
        hadPreviousRepairs: data.history.previousRepairs,
        signatureImage: data.signature,
        signatureTimestamp: new Date(),
        termsAccepted: true,
        issues: {
          create: data.problems.map((p: string) => ({
            issueType: mapIssueType(p),
          })),
        },
        conditionItems: {
          create: data.condition.damages.map((d: string) => ({
            condition: mapConditionType(d),
          })),
        },
      },
    });

    // 5. Update repair count and loyalty tier
    const repairCount = await prisma.repair.count({
      where: { customerId: customer.id }
    });

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalRepairs: repairCount,
        loyaltyTier: calculateLoyaltyTier(repairCount)
      }
    });

    return NextResponse.json({ success: true, ticketNumber });
  } catch (error) {
    console.error("Error submitting kiosk data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
