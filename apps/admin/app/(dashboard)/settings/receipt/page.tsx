import { getShopSettings } from "../../../actions/settings";
import ReceiptEditorClient from "./ReceiptEditorClient";
import { DEFAULT_RECEIPT_HTML, DEFAULT_RECEIPT_CSS } from "./defaultTemplates";
import { FileText, Printer } from "lucide-react";

export default async function ReceiptEditorPage() {
  const settings = await getShopSettings() as any;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Reparaturbeleg bearbeiten
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              HTML &amp; CSS bearbeiten · Live-Vorschau · A4-Drucklayout
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 border rounded-lg px-3 py-2 shrink-0">
          <Printer className="w-3.5 h-3.5" />
          <span>Wird beim Erstellen eines Tickets gedruckt</span>
        </div>
      </div>

      <ReceiptEditorClient
        initialHtml={settings.receiptTemplateHtml}
        initialCss={settings.receiptTemplateCss}
        defaultHtml={DEFAULT_RECEIPT_HTML}
        defaultCss={DEFAULT_RECEIPT_CSS}
      />
    </div>
  );
}
