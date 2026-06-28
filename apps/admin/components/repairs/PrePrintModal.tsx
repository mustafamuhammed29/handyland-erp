"use client";

import React, { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Trash2, Loader2, Download, X } from "lucide-react";
import { RepairOrderPDF } from "./RepairOrderPDF";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";

const DEFECT_OPTIONS = [
  { id: "DISPLAY", label: "Display" },
  { id: "BATTERY", label: "Akku" },
  { id: "CHARGING_PORT", label: "Ladebuchse" },
  { id: "SPEAKER", label: "Lautsprecher" },
  { id: "EARPIECE", label: "Ohrmuschel" },
  { id: "MICROPHONE", label: "Mikrofon" },
  { id: "CAMERA", label: "Kamera" },
  { id: "WATER_DAMAGE", label: "Wasserschaden" },
  { id: "BACK_COVER", label: "Back Cover" },
  { id: "SOFTWARE", label: "Software" },
  { id: "OTHER", label: "Sonstiges" },
];

const TIME_OPTIONS = ["30min", "45min", "1h", "1.5h", "2h", "2.5h", "3h", "4h"];

export function PrePrintModal({ repair, isOpen, onClose }: { repair: any, isOpen: boolean, onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [confirmedDefects, setConfirmedDefects] = useState<string[]>(repair.issues.map((i: any) => i.issueType));
  const [repairTime, setRepairTime] = useState<string>(repair.repairTimeEstimate || "");
  const [visibleDamages, setVisibleDamages] = useState<string>(repair.conditionNotes || "");
  const [pickupDate, setPickupDate] = useState<string>(repair.pickupDate ? new Date(repair.pickupDate).toISOString().slice(0,16) : "");
  const [price, setPrice] = useState<string>(repair.estimatedPrice ? String(repair.estimatedPrice) : "");
  
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [adminSignature, setAdminSignature] = useState<string>(repair.adminSignatureImage || "");
  const [error, setError] = useState("");
  
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [updatedRepair, setUpdatedRepair] = useState<any>(repair);

  useEffect(() => {
    QRCode.toDataURL(`https://handyland.de/track/${repair.ticketNumber}`)
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error(err));
  }, [repair.ticketNumber]);

  const toggleDefect = (id: string) => {
    setConfirmedDefects(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const handleClearSignature = () => {
    sigCanvas.current?.clear();
    setAdminSignature("");
  };

  const handleSaveAndPreview = async () => {
    let sigData = adminSignature;
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      sigData = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      setAdminSignature(sigData);
    }

    if (!sigData) {
      setError("Unterschrift des Serviceberaters ist erforderlich.");
      return;
    }
    if (!repairTime || !pickupDate || !price) {
      setError("Bitte füllen Sie alle Pflichtfelder aus (Zeitaufwand, Abholtermin, Preis).");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/repairs/${repair.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmedDefects,
          repairTime,
          visibleDamages,
          pickupDate,
          price,
          adminSignature: sigData
        })
      });

      if (!res.ok) throw new Error("Failed to save");
      
      const { repair: newRepair } = await res.json();
      
      // We also need the nested relations for the PDF
      const fullRepairRes = await fetch(`/api/repairs/${repair.id}`);
      const fullRepairData = await fullRepairRes.json();
      
      setUpdatedRepair(fullRepairData.repair);
      setStep("preview");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Fehler beim Speichern der Daten.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col relative">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {step === "form" ? "Reparaturauftrag vervollständigen" : "PDF Vorschau"}
          </h2>
          <button onClick={onClose} aria-label="Schließen" className="p-2 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
        {step === "form" && (
          <div className="space-y-6 mt-4">
            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            
            <div className="space-y-3">
              <label className="text-sm font-medium">Bestätigte Defekte / Probleme</label>
              <div className="grid grid-cols-3 gap-2">
                {DEFECT_OPTIONS.map(opt => (
                  <div key={opt.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox"
                      id={`defect-${opt.id}`} 
                      checked={confirmedDefects.includes(opt.id)}
                      onChange={() => toggleDefect(opt.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor={`defect-${opt.id}`} className="text-sm font-medium leading-none">
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Zeitaufwand für Ihre Reparatur *</label>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.map(time => (
                    <button 
                      key={time} 
                      type="button" 
                      onClick={() => setRepairTime(time)}
                      className={`px-3 py-1 text-sm rounded-md border transition-colors ${repairTime === time ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="pickupDate" className="text-sm font-medium">Abholtermin *</label>
                <input 
                  id="pickupDate"
                  type="datetime-local" 
                  value={pickupDate} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPickupDate(e.target.value)} 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bestehende optische Mängel (Freitext)</label>
              <textarea 
                value={visibleDamages} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVisibleDamages(e.target.value)} 
                placeholder="z.B. Kratzer oben links..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preis (inklusive MwSt) in € *</label>
              <input 
                type="number" 
                step="0.01" 
                value={price} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)} 
                placeholder="150.00"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Unterschrift des Serviceberaters *</label>
                <button type="button" onClick={handleClearSignature} className="flex items-center h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <Trash2 className="w-3 h-3 mr-1" /> Löschen
                </button>
              </div>
              <div className="border rounded-md bg-white touch-none">
                {adminSignature && !sigCanvas.current ? (
                  <img src={adminSignature} alt="Signature" className="h-32 object-contain cursor-pointer" onClick={() => setAdminSignature("")} />
                ) : (
                  <SignatureCanvas 
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{ width: 400, height: 128, className: "w-full h-32" }}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t gap-2">
              <button onClick={onClose} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">Abbrechen</button>
              <button onClick={handleSaveAndPreview} disabled={isSaving} className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Weiter zur Vorschau
              </button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4 h-[70vh] flex flex-col">
            <div className="flex-1 border rounded-md overflow-hidden bg-muted">
              <PDFViewer width="100%" height="100%" className="w-full h-full border-none">
                <RepairOrderPDF repair={updatedRepair} qrCodeDataUrl={qrCodeDataUrl} />
              </PDFViewer>
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={() => setStep("form")} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">Zurück zum Formular</button>
              <PDFDownloadLink document={<RepairOrderPDF repair={updatedRepair} qrCodeDataUrl={qrCodeDataUrl} />} fileName={`Reparaturauftrag_${repair.ticketNumber}.pdf`}>
                {({ loading }) => (
                  <button disabled={loading} className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    PDF speichern / Drucken
                  </button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
