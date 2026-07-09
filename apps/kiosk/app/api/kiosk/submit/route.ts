import { NextResponse } from "next/server";
import { prisma, IssueType, ConditionType, normalizePhone, calculateLoyaltyTier, encrypt, decrypt } from "@repo/database";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { renderToStream } from "@react-pdf/renderer";
import { RepairOrderPDF } from "@repo/ui/pdf/RepairOrderPDF";
import React from "react";

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

    // 3.5 Process Signature
    let signatureUrl = null;
    if (data.signature) {
      try {
        const base64Data = data.signature.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const filename = `sig_${ticketNumber}_${Date.now()}.png`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "signatures");
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        fs.writeFileSync(path.join(uploadDir, filename), buffer);
        signatureUrl = `/uploads/signatures/${filename}`;
      } catch (err) {
        console.error("Failed to save signature image:", err);
      }
    }

    // 4. Create repair
    const repair = await prisma.repair.create({
      data: {
        ticketNumber,
        ticketYear: currentYear,
        ticketSequence: sequence.lastSequence,
        customerId: customer.id,
        deviceId: device.id,
        devicePasswordEncrypted: encrypt(data.security.devicePassword) || null,
        devicePatternEncrypted: encrypt(data.security.pattern && data.security.pattern.length > 0 ? data.security.pattern.join(",") : null) || null,
        simPinEncrypted: encrypt(data.security.simPin) || null,
        hasSimCard: data.accessories.simCard,
        hasCase: data.accessories.case,
        hadPreviousRepairs: data.history.previousRepairs,
        signatureImage: signatureUrl,
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
        loyaltyTier: calculateLoyaltyTier(Number(customer.totalSpending), customer.loyaltyPoints)
      }
    });

    // 6. Generate PDF Receipt
    let receiptUrl = null;
    try {
      const trackingUrl = `https://handyland.com/track/${ticketNumber}`;
      const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, { margin: 1 });

      let processedRepair = { ...repair } as any;
      
      // Inject the newly created signature for the PDF generator
      if (signatureUrl) {
        const localPath = path.join(process.cwd(), "public", signatureUrl);
        if (fs.existsSync(localPath)) {
          const sigBuffer = fs.readFileSync(localPath);
          processedRepair.signatureImage = `data:image/png;base64,${sigBuffer.toString('base64')}`;
        }
      }

      // Add device and customer and issues to processedRepair
      processedRepair.customer = customer;
      processedRepair.device = device;
      processedRepair.issues = data.problems.map((p: string) => ({ issueType: mapIssueType(p) }));
      processedRepair.conditionItems = data.condition.damages.map((d: string) => ({ condition: mapConditionType(d) }));

      const decryptedPassword = data.security.devicePassword || undefined;
      const decryptedPin = data.security.simPin || undefined;
      const decryptedPattern = data.security.pattern && data.security.pattern.length > 0 ? data.security.pattern.join(",") : undefined;

      const pdfStream = await renderToStream(
        React.createElement(RepairOrderPDF, {
          repair: processedRepair,
          qrCodeDataUrl,
          decryptedPassword,
          decryptedPin,
          decryptedPattern,
        })
      );

      const chunks: Buffer[] = [];
      for await (const chunk of pdfStream as unknown as AsyncIterable<Buffer>) {
        chunks.push(Buffer.from(chunk));
      }
      const pdfBytes = Buffer.concat(chunks);

      const filename = `receipt_${ticketNumber}.pdf`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), pdfBytes);
      
      receiptUrl = `/uploads/receipts/${filename}`;

      await prisma.repair.update({
        where: { id: repair.id },
        data: { receiptPdfUrl: receiptUrl }
      });
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }

    return NextResponse.json({ success: true, ticketNumber, receiptUrl });
  } catch (error) {
    console.error("Error submitting kiosk data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
