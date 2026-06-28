"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function getShopSettings() {
  let settings = await prisma.shopSettings.findUnique({
    where: { id: "singleton" }
  });

  if (!settings) {
    settings = await prisma.shopSettings.create({
      data: {
        id: "singleton",
        shopName: "HANDYLAND",
        receiptTemplateHtml: null,
        receiptTemplateCss: null
      } as any
    });
  }

  return settings;
}

export async function saveReceiptTemplate(html: string, css: string) {
  try {
    await prisma.shopSettings.upsert({
      where: { id: "singleton" },
      update: {
        receiptTemplateHtml: html,
        receiptTemplateCss: css,
      } as any,
      create: {
        id: "singleton",
        shopName: "HANDYLAND",
        receiptTemplateHtml: html,
        receiptTemplateCss: css,
      } as any
    });

    revalidatePath("/settings/receipt");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
