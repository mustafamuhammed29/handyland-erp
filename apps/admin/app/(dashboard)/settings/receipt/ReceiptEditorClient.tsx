"use client";

import { useState } from "react";
import { saveReceiptTemplate } from "../../../actions/settings";
import { Save, RefreshCw, CheckCircle2, ZoomIn, ZoomOut, Eye, Settings2 } from "lucide-react";
import { ReceiptPrintLayout, ReceiptConfig, DEFAULT_RECEIPT_CONFIG } from "../../../../components/repairs/ReceiptPrintLayout";

// Dummy Data
const DUMMY_REPAIR = {
  customer: { firstName: "Max", lastName: "Mustermann", phone: "0176 12345678", email: "max@example.com" },
  device: { manufacturer: "Apple", model: "iPhone 13 Pro" },
  devicePasswordEncrypted: "123456",
  simPinEncrypted: "0000",
  devicePatternEncrypted: "0,1,2,5,8",
  hasSimCard: true,
  hasCase: false,
  hadPreviousRepairs: false,
  previousRepairsDesc: "",
  conditionItems: [{ condition: "Leichte Kratzer am Display" }],
  issues: [{ issueType: "DISPLAY" }, { issueType: "BATTERY" }],
  repairTimeEstimate: "1h",
  pickupDate: new Date(Date.now() + 86400000).toISOString(),
  estimatedPrice: "150.00",
  createdAt: new Date().toISOString(),
  ticketNumber: "HL-2024-000042",
};

export default function ReceiptEditorClient({ initialConfigString }: { initialConfigString?: string | null }) {
  const [config, setConfig] = useState<ReceiptConfig>(() => {
    if (initialConfigString) {
      try {
        const parsed = JSON.parse(initialConfigString);
        if (parsed && parsed.shopNameMain) return parsed;
      } catch (e) {
        // Fallback to default if not JSON (e.g. old HTML string)
      }
    }
    return DEFAULT_RECEIPT_CONFIG;
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [scale, setScale] = useState(0.55);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const configStr = JSON.stringify(config);
      await saveReceiptTemplate(configStr, "");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ReceiptConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border bg-background overflow-hidden shadow-sm">
      
      {/* LEFT: Configurator Form */}
      <div className="w-[380px] min-w-[350px] border-r flex flex-col bg-card relative z-10 shrink-0">
        
        {/* Header */}
        <div className="h-14 border-b flex items-center justify-between px-4 bg-muted/30">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Settings2 className="w-4 h-4 text-primary" />
            Visueller Editor
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfig(DEFAULT_RECEIPT_CONFIG)}
              className="text-xs px-2 py-1 rounded text-muted-foreground hover:bg-muted"
            >
              <RefreshCw className="w-3 h-3 inline mr-1" /> Reset
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saveSuccess ? "Gespeichert!" : "Speichern"}
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold border-b pb-2">Branding & Kopfzeile</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Shop Name (Teil 1)</label>
                <input value={config.shopNameMain} onChange={e => handleChange("shopNameMain", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Shop Name (Teil 2)</label>
                <input value={config.shopNameSub} onChange={e => handleChange("shopNameSub", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Untertitel</label>
              <input value={config.headerSubtitle} onChange={e => handleChange("headerSubtitle", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold border-b pb-2">Rechtstexte (AGB)</h3>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Absatz 1 (Haftung für Daten)</label>
              <textarea value={config.legalParagraph1} onChange={e => handleChange("legalParagraph1", e.target.value)} className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Absatz 2 (Warnhinweis)</label>
              <textarea value={config.legalParagraph2} onChange={e => handleChange("legalParagraph2", e.target.value)} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Absatz 3 (Haftung für Teile)</label>
              <textarea value={config.legalParagraph3} onChange={e => handleChange("legalParagraph3", e.target.value)} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Absatz 4 (Abholfrist)</label>
              <textarea value={config.legalParagraph4} onChange={e => handleChange("legalParagraph4", e.target.value)} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold border-b pb-2">Fußzeile</h3>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Footer Text</label>
              <input value={config.footerText} onChange={e => handleChange("footerText", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-black/20 shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Eye className="w-4 h-4" /> Live-Vorschau (A4)
          </div>
          <div className="flex items-center gap-1 bg-white/10 rounded-md p-1">
            <button onClick={() => setScale(s => Math.max(0.3, s - 0.1))} className="p-1 hover:bg-white/10 rounded text-slate-300"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-xs text-slate-300 w-12 text-center font-mono">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))} className="p-1 hover:bg-white/10 rounded text-slate-300"><ZoomIn className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-900/50 p-8 custom-scrollbar">
          <div 
            className="origin-top-left mx-auto transition-transform"
            style={{ 
              transform: `scale(${scale})`, 
              width: '210mm', 
              minHeight: '297mm',
              marginBottom: `${(scale - 1) * 297}mm`
            }}
          >
            <ReceiptPrintLayout repair={DUMMY_REPAIR} config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}
