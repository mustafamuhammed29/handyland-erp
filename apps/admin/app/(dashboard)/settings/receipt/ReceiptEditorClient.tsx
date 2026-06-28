"use client";

import { useState, useRef, useEffect } from "react";
import { saveReceiptTemplate } from "../../../actions/settings";
import {
  Save, Paintbrush, RefreshCw, CheckCircle2, Copy, Check,
  Printer, ZoomIn, ZoomOut, ChevronDown, ChevronRight,
  Hash, FileCode2, Eye,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// Variable definitions for sidebar
// ─────────────────────────────────────────────────────────
type VariableGroup = {
  label: string;
  color: string;
  vars: { key: string; description: string }[];
};

const VARIABLE_GROUPS: VariableGroup[] = [
  {
    label: "Kunde",
    color: "#3b82f6",
    vars: [
      { key: "{{customerName}}",  description: "Vor- und Nachname" },
      { key: "{{customerPhone}}", description: "Telefonnummer" },
      { key: "{{customerEmail}}", description: "E-Mail-Adresse" },
    ],
  },
  {
    label: "Gerät",
    color: "#f59e0b",
    vars: [
      { key: "{{deviceModel}}",    description: "Hersteller & Modell" },
      { key: "{{devicePassword}}", description: "Geräte-Passwort" },
      { key: "{{simPin}}",         description: "SIM-PIN" },
      { key: "{{hasSimCardYes}}", description: "\"checked\" wenn SIM Ja" },
      { key: "{{hasSimCardNo}}",  description: "\"checked\" wenn SIM Nein" },
      { key: "{{hasCaseYes}}",    description: "\"checked\" wenn Hülle Ja" },
      { key: "{{hasCaseNo}}",     description: "\"checked\" wenn Hülle Nein" },
    ],
  },
  {
    label: "Probleme",
    color: "#ef4444",
    vars: [
      { key: "{{issue_DISPLAY}}",       description: "Display-Problem" },
      { key: "{{issue_BATTERY}}",       description: "Akku-Problem" },
      { key: "{{issue_SPEAKER}}",       description: "Lautsprecher" },
      { key: "{{issue_EARPIECE}}",      description: "Ohrmuschel" },
      { key: "{{issue_MICROPHONE}}",    description: "Mikrofon" },
      { key: "{{issue_BACK_COVER}}",    description: "Rückseite" },
      { key: "{{issue_CHARGING_PORT}}", description: "Ladebuchse" },
      { key: "{{issue_WATER_DAMAGE}}", description: "Wasserschaden" },
      { key: "{{issue_OTHER}}",         description: "Sonstiges (checkbox)" },
      { key: "{{otherIssues}}",         description: "Sonstiges-Text" },
    ],
  },
  {
    label: "Reparatur",
    color: "#10b981",
    vars: [
      { key: "{{hadPreviousRepairsNo}}",  description: "Keine früh. Reparaturen" },
      { key: "{{hadPreviousRepairsYes}}", description: "Frühere Reparaturen Ja" },
      { key: "{{previousRepairsDesc}}",   description: "Beschreibung frühere Rep." },
      { key: "{{conditionNotes}}",        description: "Zustandsnotizen" },
      { key: "{{repairTimeEstimate}}",    description: "Zeitaufwand für Reparatur" },
      { key: "{{pickupDate}}",            description: "Abholtermin" },
      { key: "{{estimatedPrice}}",        description: "Preis inkl. MwSt." },
    ],
  },
  {
    label: "Dokument",
    color: "#a855f7",
    vars: [
      { key: "{{createdAt}}",           description: "Erstellungsdatum" },
      { key: "{{ticketNumber}}",        description: "Ticket-Nummer" },
      { key: "{{signatureImage}}",      description: "Unterschrift Kunde (HTML)" },
      { key: "{{adminSignatureImage}}", description: "Unterschrift Service (HTML)" },
    ],
  },
];

// ─────────────────────────────────────────────────────────
// Dummy data for live preview
// ─────────────────────────────────────────────────────────
const DUMMY_DATA: Record<string, string> = {
  "{{customerName}}":          "Max Mustermann",
  "{{customerPhone}}":         "0176 12345678",
  "{{customerEmail}}":         "max@example.com",
  "{{devicePassword}}":        "123456",
  "{{simPin}}":                "0000",
  "{{deviceModel}}":           "Apple iPhone 13 Pro",
  "{{hasSimCardYes}}":         "checked",
  "{{hasSimCardNo}}":          "",
  "{{hasCaseYes}}":            "",
  "{{hasCaseNo}}":             "checked",
  "{{hadPreviousRepairsNo}}":  "checked",
  "{{hadPreviousRepairsYes}}": "",
  "{{previousRepairsDesc}}":   "",
  "{{conditionNotes}}":        "Leichte Kratzer am Display",
  "{{issue_DISPLAY}}":         "checked",
  "{{issue_BATTERY}}":         "checked",
  "{{issue_SPEAKER}}":         "",
  "{{issue_EARPIECE}}":        "",
  "{{issue_MICROPHONE}}":      "",
  "{{issue_BACK_COVER}}":      "",
  "{{issue_CHARGING_PORT}}":   "",
  "{{issue_WATER_DAMAGE}}":    "",
  "{{issue_OTHER}}":           "",
  "{{otherIssues}}":           "Glas ist gesprungen",
  "{{pickupDate}}":            "30.06.2026 15:00",
  "{{estimatedPrice}}":        "€ 149.00",
  "{{createdAt}}":             "28.06.2026",
  "{{signatureImage}}":        "<div style='font-style:italic;padding-top:10px;'>M. Mustermann</div>",
  "{{ticketNumber}}":          "2026001",
  "{{devicePatternSvg}}":      "",
};

// ─────────────────────────────────────────────────────────
// Sub-component: Variable item (copy on click)
// ─────────────────────────────────────────────────────────
function VarItem({ varKey, description }: { varKey: string; description: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(varKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title={`Kopieren: ${varKey}`}
      className="w-full text-left group px-3 py-1.5 hover:bg-white/5 rounded-md transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <code className="text-[10px] font-mono text-yellow-300/90 truncate flex-1">
          {varKey}
        </code>
        {copied ? (
          <Check className="w-3 h-3 text-green-400 shrink-0" />
        ) : (
          <Copy className="w-3 h-3 text-gray-600 group-hover:text-gray-400 shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
        )}
      </div>
      <p className="text-[9px] text-gray-600 mt-0.5 truncate leading-tight">
        {description}
      </p>
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// Sub-component: Collapsible variable group
// ─────────────────────────────────────────────────────────
function VarGroup({ group }: { group: VariableGroup }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-md transition-colors"
      >
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: group.color }}
        />
        <span className="text-[11px] font-semibold text-gray-300 flex-1 text-left">
          {group.label}
        </span>
        {open ? (
          <ChevronDown className="w-3 h-3 text-gray-600" />
        ) : (
          <ChevronRight className="w-3 h-3 text-gray-600" />
        )}
      </button>

      {open && (
        <div className="ml-3 pl-2 border-l border-white/[0.07] pb-1">
          {group.vars.map((v) => (
            <VarItem key={v.key} varKey={v.key} description={v.description} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Sub-component: Code editor with synced line numbers
// ─────────────────────────────────────────────────────────
function CodeEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lineCount = value.split("\n").length;

  const syncScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Line numbers column */}
      <div
        ref={lineNumbersRef}
        aria-hidden="true"
        className="shrink-0 w-11 overflow-hidden select-none bg-[#0d1117] border-r border-white/[0.07]"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="py-4 pr-3 text-right">
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="text-[11px] text-gray-600 font-mono"
              style={{ lineHeight: "1.625rem" /* matches leading-6.5 */ }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        className="flex-1 h-full resize-none focus:outline-none bg-[#0d1117] text-[#e6edf3] font-mono text-[12.5px] py-4 px-4"
        style={{ lineHeight: "1.625rem", caretColor: "#f9c74f" }}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Zoom preset buttons
// ─────────────────────────────────────────────────────────
const ZOOM_PRESETS = [0.4, 0.55, 0.7, 0.85, 1.0];

// ─────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────
export default function ReceiptEditorClient({
  initialHtml,
  initialCss,
  defaultHtml,
  defaultCss,
}: {
  initialHtml: string | null;
  initialCss: string | null;
  defaultHtml: string;
  defaultCss: string;
}) {
  const [html, setHtml] = useState(initialHtml || defaultHtml);
  const [css, setCss] = useState(initialCss || defaultCss);
  const [activeTab, setActiveTab] = useState<"html" | "css">("html");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [zoom, setZoom] = useState(0.55);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const savedHtml = useRef(initialHtml || defaultHtml);
  const savedCss = useRef(initialCss || defaultCss);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(
      html !== savedHtml.current || css !== savedCss.current
    );
  }, [html, css]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveReceiptTemplate(html, css);
    setIsSaving(false);
    if (res.success) {
      savedHtml.current = html;
      savedCss.current = css;
      setHasUnsavedChanges(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert("Fehler beim Speichern: " + res.error);
    }
  };

  const handleReset = () => {
    if (
      !confirm(
        "Zur Standardvorlage zurückkehren? Alle Änderungen gehen verloren."
      )
    )
      return;
    setHtml(defaultHtml);
    setCss(defaultCss);
  };

  const handlePrint = () => {
    const iframe = document.getElementById(
      "receipt-preview-iframe"
    ) as HTMLIFrameElement | null;
    iframe?.contentWindow?.print();
  };

  // Build preview HTML (replace all variables with dummy data)
  let previewHtml = html;
  for (const [key, val] of Object.entries(DUMMY_DATA)) {
    previewHtml = previewHtml.split(key).join(val);
  }

  const currentValue = activeTab === "html" ? html : css;
  const lineCount = currentValue.split("\n").length;
  const charCount = currentValue.length;

  // Height compensation for scaled iframe inside scrollable container
  // When zoom < 1 the element shrinks visually but keeps its layout height,
  // so we add a negative margin-bottom to pull the scroll back.
  const iframeLayoutHeightMm = 297;
  const marginBottomMm = (zoom - 1) * iframeLayoutHeightMm;

  return (
    <div
      className="flex rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d1117]"
      style={{ height: "calc(100vh - 148px)" }}
    >
      {/* ════════════════════════════════════════
          LEFT — Variables Sidebar
      ════════════════════════════════════════ */}
      <aside className="w-52 shrink-0 flex flex-col border-r border-white/[0.07] bg-[#010409]">
        {/* Header */}
        <div className="px-3 py-3 border-b border-white/[0.07] shrink-0">
          <div className="flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[11px] font-bold text-gray-200 uppercase tracking-widest">
              Variablen
            </span>
          </div>
          <p className="text-[9px] text-gray-600 mt-1 leading-tight">
            Klicken zum Kopieren &amp; in Code einfügen
          </p>
        </div>

        {/* Groups */}
        <div className="flex-1 overflow-y-auto py-2 px-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#2d2d2d transparent" }}>
          {VARIABLE_GROUPS.map((group) => (
            <VarGroup key={group.label} group={group} />
          ))}
        </div>

        {/* Footer tip */}
        <div className="px-3 py-2.5 border-t border-white/[0.07] shrink-0">
          <p className="text-[9px] text-gray-600 leading-relaxed">
            Checkbox-Status:{" "}
            <code className="text-yellow-300/60">class="checked"</code>
          </p>
        </div>
      </aside>

      {/* ════════════════════════════════════════
          MIDDLE — Code Editor
      ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col border-r border-white/[0.07] min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.07] bg-[#161b22] shrink-0 gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("html")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                activeTab === "html"
                  ? "bg-[#0d1117] text-orange-400 shadow-md"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <FileCode2 className="w-3 h-3" />
              HTML
            </button>
            <button
              onClick={() => setActiveTab("css")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                activeTab === "css"
                  ? "bg-[#0d1117] text-blue-400 shadow-md"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Paintbrush className="w-3 h-3" />
              CSS
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {hasUnsavedChanges && (
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-amber-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Nicht gespeichert
              </div>
            )}

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-gray-500 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all disabled:opacity-50 ${
                saved
                  ? "bg-green-500/15 text-green-400 border border-green-500/30"
                  : "bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95"
              }`}
            >
              {isSaving ? (
                <span className="w-3 h-3 border-2 border-black/50 border-t-black rounded-full animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              {saved ? "Gespeichert!" : "Speichern"}
            </button>
          </div>
        </div>

        {/* Editor with line numbers */}
        <CodeEditor
          value={currentValue}
          onChange={(v) => (activeTab === "html" ? setHtml(v) : setCss(v))}
        />

        {/* VS Code-style status bar */}
        <div className="h-5 bg-[#0066b8] flex items-center px-3 gap-5 shrink-0">
          <span className="text-[10px] text-white/70 font-medium">
            {lineCount} Zeilen
          </span>
          <span className="text-[10px] text-white/70 font-medium">
            {charCount.toLocaleString("de-DE")} Zeichen
          </span>
          <span className="text-[10px] text-white/70 font-medium uppercase tracking-wide">
            {activeTab}
          </span>
          <span className="ml-auto text-[10px] text-white/50">UTF-8</span>
        </div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT — Live Preview
      ════════════════════════════════════════ */}
      <div className="w-[460px] shrink-0 flex flex-col">
        {/* Preview toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.07] bg-[#161b22] shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-200">
              Vorschau
            </span>
            <span className="text-[9px] text-gray-600 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              A4 Live
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Zoom out */}
            <button
              onClick={() =>
                setZoom((z) => Math.max(0.3, parseFloat((z - 0.15).toFixed(2))))
              }
              className="p-1.5 text-gray-500 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors"
              title="Verkleinern"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Zoom presets */}
            {ZOOM_PRESETS.map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`px-1.5 py-0.5 text-[10px] rounded transition-all font-mono ${
                  Math.abs(zoom - z) < 0.01
                    ? "bg-yellow-400/20 text-yellow-300 font-bold"
                    : "text-gray-600 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                {Math.round(z * 100)}%
              </button>
            ))}

            {/* Zoom in */}
            <button
              onClick={() =>
                setZoom((z) => Math.min(1.0, parseFloat((z + 0.15).toFixed(2))))
              }
              className="p-1.5 text-gray-500 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors"
              title="Vergrößern"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Divider */}
            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-gray-500 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors"
              title="Drucken (Vorschau)"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Preview area — checkered background like design tools */}
        <div
          className="flex-1 overflow-auto"
          style={{
            background:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            backgroundColor: "#0a0a14",
          }}
        >
          <div
            style={{
              width: "210mm",
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: "24px",
              marginBottom: `calc(${marginBottomMm}mm + 24px)`,
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
            }}
          >
            <iframe
              id="receipt-preview-iframe"
              title="Vorschau"
              style={{ width: "210mm", minHeight: "297mm", display: "block" }}
              className="shadow-[0_0_80px_rgba(0,0,0,0.8)]"
              srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body>${previewHtml}</body></html>`}
            />
          </div>
        </div>

        {/* Preview footer */}
        <div className="px-3 py-2 border-t border-white/[0.07] bg-[#161b22] shrink-0">
          <p className="text-[9px] text-gray-600 text-center">
            Beispieldaten für Vorschau · Echte Kundendaten beim Druck
          </p>
        </div>
      </div>
    </div>
  );
}
