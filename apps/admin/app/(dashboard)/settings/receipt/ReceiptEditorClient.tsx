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
        if (parsed && parsed.shopNameMain) return { ...DEFAULT_RECEIPT_CONFIG, ...parsed };
      } catch (e) {}
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
    setConfig((prev: ReceiptConfig) => ({ ...prev, [field]: value }));
  };

  const Field = ({ label, field, multiline = false }: { label: string, field: keyof ReceiptConfig, multiline?: boolean }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {multiline ? (
        <textarea 
          value={config[field]} 
          onChange={e => handleChange(field, e.target.value)} 
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y" 
        />
      ) : (
        <input 
          value={config[field]} 
          onChange={e => handleChange(field, e.target.value)} 
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
        />
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border bg-background overflow-hidden shadow-sm">
      
      {/* LEFT: Configurator Form */}
      <div className="w-[420px] min-w-[350px] border-r flex flex-col bg-card relative z-10 shrink-0">
        
        {/* Header */}
        <div className="h-14 border-b flex items-center justify-between px-4 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Settings2 className="w-4 h-4 text-primary" />
            Vollständige Kontrolle
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
        <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold border-b pb-2 text-primary">Kopfzeile (Header)</h3>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Shop Name (Teil 1)" field="shopNameMain" />
              <Field label="Shop Name (Teil 2)" field="shopNameSub" />
            </div>
            <Field label="Untertitel" field="headerSubtitle" />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold border-b pb-2 text-primary">1. Ihre persönlichen Daten</h3>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Sektion Titel" field="sec1Title" />
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Sektion Untertitel</label>
                <div className="flex gap-1">
                  <input value={config.sec1Sub1} onChange={e => handleChange('sec1Sub1', e.target.value)} className="flex h-9 w-1/2 rounded-md border border-input bg-transparent px-2 text-xs" />
                  <input value={config.sec1Sub2} onChange={e => handleChange('sec1Sub2', e.target.value)} className="flex h-9 w-1/2 rounded-md border border-input bg-transparent px-2 text-xs font-bold" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Feld: Name" field="lblCustomerName" />
              <Field label="Feld: Telefon/E-Mail" field="lblPhoneEmail" />
              <Field label="Feld: Passwort" field="lblPassword" />
              <Field label="Feld: Passwort (klein)" field="lblPasswordSub" />
              <Field label="Feld: SIM-Pin" field="lblSimPin" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold border-b pb-2 text-primary">2. Ihre Gerätedaten</h3>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Sektion Titel" field="sec2Title" />
              <Field label="Sektion Untertitel" field="sec2Sub" />
              <Field label="Feld: Gerät" field="lblDevice" />
              <Field label="Feld: SIM Karte" field="lblSimCard" />
              <Field label="Feld: Hülle" field="lblCase" />
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Optionen (Ja/Nein)</label>
                <div className="flex gap-1">
                  <input value={config.lblYes} onChange={e => handleChange('lblYes', e.target.value)} className="flex h-9 w-1/2 rounded-md border border-input bg-transparent px-2 text-xs" />
                  <input value={config.lblNo} onChange={e => handleChange('lblNo', e.target.value)} className="flex h-9 w-1/2 rounded-md border border-input bg-transparent px-2 text-xs" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold border-b pb-2 text-primary">3. Aufnahmeprotokoll</h3>
            <Field label="Sektion Titel" field="sec3Title" />
            <Field label="Sektion Untertitel" field="sec3Sub" />
            
            <div className="p-3 bg-muted/30 rounded-lg space-y-3">
              <p className="text-xs font-semibold">Reparatur-Historie</p>
              <Field label="Frage" field="txtPrevRepairsQ" />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Option Nein" field="txtPrevRepairsNo" />
                <Field label="Option Ja (Teil 1)" field="txtPrevRepairsYes" />
                <Field label="Option Ja (Bold)" field="txtPrevRepairsBold" />
                <Field label="Option Ja (Ende)" field="txtPrevRepairsEnd" />
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg space-y-3">
              <p className="text-xs font-semibold">Optische Mängel</p>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Text Vorher" field="txtCondBefore" />
                <Field label="Text Bold" field="txtCondBold" />
                <Field label="Text Nachher" field="txtCondAfter" />
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg space-y-3">
              <p className="text-xs font-semibold">Defekte & Probleme</p>
              <Field label="Titel (nutze \n für Zeilenumbruch)" field="lblDefects" />
              <div className="grid grid-cols-3 gap-2">
                <Field label="Lautsprecher" field="defSpeaker" />
                <Field label="Ohrmuschel" field="defEarpiece" />
                <Field label="Mikrofon" field="defMic" />
                <Field label="Display" field="defDisplay" />
                <Field label="Back Cover" field="defBackCover" />
                <Field label="Akku" field="defBattery" />
                <Field label="Ladebuchse" field="defChargingPort" />
                <Field label="Wasserschaden" field="defWaterDamage" />
                <Field label="Sonstiges" field="defOther" />
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg space-y-3">
              <p className="text-xs font-semibold">Reparaturdetails</p>
              <Field label="Titel Zeitaufwand (nutze \n)" field="lblTimeEstimate" />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Titel Abholtermin" field="lblPickupDate" />
                <Field label="Titel Preis" field="lblPrice" />
              </div>
              <Field label="Titel Unterschrift Service (nutze \n)" field="lblAdminSignature" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold border-b pb-2 text-primary">Rechtstexte (AGB)</h3>
            <Field label="Absatz 1 (Haftung für Daten)" field="legalParagraph1" multiline />
            <Field label="Absatz 2 (Warnhinweis)" field="legalParagraph2" multiline />
            <Field label="Absatz 3 (Haftung für Teile)" field="legalParagraph3" multiline />
            <Field label="Absatz 4 (Abholfrist)" field="legalParagraph4" multiline />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold border-b pb-2 text-primary">Kundenunterschrift & Fußzeile</h3>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Feld: Datum" field="lblDate" />
              <Field label="Feld: Ticket" field="lblTicket" />
            </div>
            <Field label="Titel: Unterschrift" field="lblCustomerSignature" />
            
            <div className="p-3 bg-muted/30 rounded-lg space-y-3">
              <p className="text-xs font-semibold">Bedingungen-Text neben Unterschrift</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Zeile 1 (Normal)" field="txtCustSig1" />
                <Field label="Zeile 1 (Bold)" field="txtCustSigBold1" />
                <Field label="Zeile 2 (Normal)" field="txtCustSig2" />
                <Field label="Zeile 2 (Bold)" field="txtCustSigBold2" />
              </div>
            </div>

            <Field label="Footer Text" field="footerText" />
          </div>

          <div className="pb-10"></div>
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
