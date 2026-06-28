import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import { getShopSettings } from "../../actions/settings";
import { ReceiptPrintLayout, ReceiptConfig, DEFAULT_RECEIPT_CONFIG } from "../../../components/repairs/ReceiptPrintLayout";

export const dynamic = "force-dynamic";

export default async function PrintTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [repair, settings] = await Promise.all([
    prisma.repair.findUnique({
      where: { id },
      include: {
        customer: true,
        device: true,
        issues: true,
        conditionItems: true,
      }
    }),
    getShopSettings()
  ]);

  if (!repair) return notFound();

  let config: ReceiptConfig = DEFAULT_RECEIPT_CONFIG;
  if (settings && (settings as any).receiptTemplateHtml) {
    try {
      const parsed = JSON.parse((settings as any).receiptTemplateHtml);
      if (parsed && parsed.shopNameMain) {
        config = parsed;
      }
    } catch (e) {
      // Fallback to default if old HTML string is found
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 0; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}} />
      <div className="bg-gray-100 min-h-screen py-10 print:bg-white print:py-0">
        <ReceiptPrintLayout repair={repair} config={config} />
      </div>

      <div className="text-center mt-4 mb-10 no-print font-sans">
        <button 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow font-medium"
        >
          Die Seite wird beim Laden automatisch gedruckt.
        </button>
      </div>

      <script dangerouslySetInnerHTML={{ __html: 'window.onload = function() { window.print(); }' }} />
    </>
  );
}
