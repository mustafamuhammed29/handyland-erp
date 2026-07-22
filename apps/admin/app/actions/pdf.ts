"use server";

import { prisma, decrypt } from "@repo/database";
import { renderToStream } from "@react-pdf/renderer";
import { RepairOrderPDF } from "@repo/ui/pdf/RepairOrderPDF";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import React from "react";

export async function generateRepairReceipt(repairId: string) {
  try {
    const repair = await prisma.repair.findUnique({
      where: { id: repairId },
      include: { customer: true, device: true, issues: true, conditionItems: true }
    });
    
    if (!repair) throw new Error("Reparatur nicht gefunden");

    // QR Code
    const trackingUrl = `https://handyland.com/track/${repair.ticketNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, { margin: 1 });

    // Ensure signatures have absolute internal paths or base64 format for the PDF generator
    let processedRepair = { ...repair };

    if (processedRepair.signatureImage) {
      const localPath = path.join(process.cwd(), "..", "kiosk", "public", processedRepair.signatureImage);
      if (fs.existsSync(localPath)) {
        const sigBuffer = fs.readFileSync(localPath);
        processedRepair.signatureImage = `data:image/png;base64,${sigBuffer.toString('base64')}`;
      }
    }

    if (processedRepair.adminSignatureImage) {
      const localAdminPath = path.join(process.cwd(), "public", processedRepair.adminSignatureImage);
      if (fs.existsSync(localAdminPath)) {
        const adminSigBuffer = fs.readFileSync(localAdminPath);
        processedRepair.adminSignatureImage = `data:image/png;base64,${adminSigBuffer.toString('base64')}`;
      }
    }

    // Decrypt security fields for the PDF
    const decryptedPassword = decrypt(repair.devicePasswordEncrypted);
    const decryptedPin = decrypt(repair.simPinEncrypted);
    const decryptedPattern = decrypt(repair.devicePatternEncrypted);

    // Render React Component to a PDF Stream
    const pdfStream = await renderToStream(
      React.createElement(RepairOrderPDF, {
        repair: processedRepair,
        qrCodeDataUrl,
        decryptedPassword: decryptedPassword || undefined,
        decryptedPin: decryptedPin || undefined,
        decryptedPattern: decryptedPattern || undefined,
      }) as any
    );

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream as unknown as AsyncIterable<Buffer>) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBytes = Buffer.concat(chunks);

    // Save to admin public dir so it can be served
    const filename = `receipt_${repair.ticketNumber}.pdf`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, pdfBytes);
    
    const receiptPdfUrl = `/uploads/receipts/${filename}`;

    // Update Repair
    await prisma.repair.update({
      where: { id: repairId },
      data: { receiptPdfUrl }
    });

    return { success: true, url: receiptPdfUrl };
  } catch (error: any) {
    console.error("PDF Gen Error:", error);
    return { success: false, error: error.message };
  }
}
