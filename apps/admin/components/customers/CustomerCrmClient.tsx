"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Wrench, Smartphone, FileText, ShieldCheck, Calendar, Eye, Printer, Trash2, Plus } from "lucide-react";
import { addCustomerNote, deleteCustomerNote, updateCustomerConsent, recalculateCustomerSpending } from "../../app/actions/customers";

type CRMProps = {
  customer: any; // Serialized customer data with all relations
};

export function CustomerCrmClient({ customer }: CRMProps) {
  const [activeTab, setActiveTab] = useState<"repairs" | "devices" | "notes" | "consent">("repairs");
  const [noteInput, setNoteInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for toggles to feel instant
  const [gdpr, setGdpr] = useState(customer.gdprConsent);
  const [marketing, setMarketing] = useState(customer.marketingConsent);

  const activeRepairs = customer.repairs.filter((r: any) => !["DELIVERED", "CANCELLED"].includes(r.status));
  const pastRepairs = customer.repairs.filter((r: any) => ["DELIVERED", "CANCELLED"].includes(r.status));

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setIsSaving(true);
    const res = await addCustomerNote(customer.id, noteInput);
    if (res.success) {
      setNoteInput("");
    } else {
      alert("Fehler beim Speichern: " + res.error);
    }
    setIsSaving(false);
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Notiz löschen?")) return;
    setIsSaving(true);
    await deleteCustomerNote(id, customer.id);
    setIsSaving(false);
  };

  const handleConsentToggle = async (type: "gdpr" | "marketing", val: boolean) => {
    let newGdpr = gdpr;
    let newMarketing = marketing;
    
    if (type === "gdpr") {
      newGdpr = val;
      setGdpr(val);
    } else {
      newMarketing = val;
      setMarketing(val);
    }

    await updateCustomerConsent(customer.id, newGdpr, newMarketing);
  };

  const handleRecalculateStats = async () => {
    setIsSaving(true);
    await recalculateCustomerSpending(customer.id);
    setIsSaving(false);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "VIP": return "bg-purple-100 text-purple-800 border-purple-200";
      case "GOLD": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "SILVER": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-orange-100 text-orange-800 border-orange-200"; // Bronze
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top CRM Stats Card */}
      <div className="bg-gradient-to-r from-card to-muted border rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 items-center">
        <div className="flex gap-8 w-full md:w-auto">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Loyalitätsstatus</p>
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold tracking-widest border ${getTierColor(customer.loyaltyTier)}`}>
              {customer.loyaltyTier}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Gesamtumsatz</p>
            <p className="text-2xl font-bold font-mono text-foreground">
              {Number(customer.totalSpending).toFixed(2)} €
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Reparaturen</p>
            <p className="text-2xl font-bold font-mono text-foreground">
              {customer.totalRepairs}
            </p>
          </div>
        </div>
        <button 
          onClick={handleRecalculateStats}
          disabled={isSaving}
          className="text-xs font-medium bg-background border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
        >
          {isSaving ? "Berechne..." : "Statistiken aktualisieren"}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b hide-scrollbar">
        {[
          { id: "repairs", label: "Reparaturen", icon: Wrench },
          { id: "devices", label: "Geräte", icon: Smartphone },
          { id: "notes", label: "CRM Notizen", icon: FileText },
          { id: "consent", label: "Datenschutz & Marketing", icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                isActive 
                  ? "border-accent text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
              {tab.id === "notes" && customer.notes.length > 0 && (
                <span className="ml-1 bg-muted px-1.5 py-0.5 rounded-full text-[10px] leading-none">
                  {customer.notes.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="min-h-[400px]">
        
        {/* REPAIRS TAB */}
        {activeTab === "repairs" && (
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                Aktiv <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">{activeRepairs.length}</span>
              </h3>
              {activeRepairs.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Keine aktiven Reparaturen.</p>
              ) : (
                <div className="grid gap-4">
                  {activeRepairs.map((r: any) => (
                    <RepairCard key={r.id} repair={r} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                Abgeschlossen <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">{pastRepairs.length}</span>
              </h3>
              {pastRepairs.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Bisher keine abgeschlossenen Reparaturen.</p>
              ) : (
                <div className="grid gap-4">
                  {pastRepairs.map((r: any) => (
                    <RepairCard key={r.id} repair={r} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DEVICES TAB */}
        {activeTab === "devices" && (
          <div>
            {customer.devices.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Keine Geräte registriert.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {customer.devices.map((device: any) => (
                  <div key={device.id} className="bg-card border rounded-xl p-5 hover:bg-muted/10 transition-colors">
                    <h4 className="font-bold text-lg mb-1">{device.manufacturer} {device.model}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground mt-3">
                      <p><span className="font-medium text-foreground">IMEI:</span> {device.imei || "-"}</p>
                      <p><span className="font-medium text-foreground">S/N:</span> {device.serialNumber || "-"}</p>
                      <p><span className="font-medium text-foreground">Farbe:</span> {device.color || "-"}</p>
                      <p><span className="font-medium text-foreground">Speicher:</span> {device.storage || "-"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === "notes" && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col gap-3">
              <textarea 
                rows={3}
                placeholder="Neue interne Notiz zum Kunden hinzufügen..."
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                className="w-full p-3 bg-background border rounded-lg text-sm resize-none focus:ring-2 focus:ring-accent outline-none"
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleAddNote}
                  disabled={isSaving || !noteInput.trim()}
                  className="bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Notiz speichern
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {customer.notes.map((note: any) => (
                <div key={note.id} className="bg-muted/30 border rounded-xl p-4 relative group">
                  <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-muted-foreground/10 text-xs text-muted-foreground">
                    <span>Erstellt von {note.staff?.name || "Mitarbeiter"} am {format(new Date(note.createdAt), "dd.MM.yyyy HH:mm")}</span>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={isSaving}
                      className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {customer.notes.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-8">Keine Notizen vorhanden.</p>
              )}
            </div>
          </div>
        )}

        {/* CONSENT TAB */}
        {activeTab === "consent" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm flex items-start gap-4">
              <div className="mt-1">
                <input 
                  type="checkbox" 
                  checked={gdpr}
                  onChange={(e) => handleConsentToggle("gdpr", e.target.checked)}
                  className="w-5 h-5 accent-accent"
                />
              </div>
              <div>
                <h4 className="font-semibold">DSGVO-Zustimmung (Datenschutz)</h4>
                <p className="text-sm text-muted-foreground mt-1 mb-2">
                  Der Kunde stimmt der Verarbeitung seiner personenbezogenen Daten zur Erfüllung des Auftrags zu.
                </p>
                {customer.gdprConsentAt && gdpr && (
                  <p className="text-xs text-green-600 font-medium">Zugegstimmt am: {format(new Date(customer.gdprConsentAt), "dd.MM.yyyy HH:mm")}</p>
                )}
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm flex items-start gap-4">
              <div className="mt-1">
                <input 
                  type="checkbox" 
                  checked={marketing}
                  onChange={(e) => handleConsentToggle("marketing", e.target.checked)}
                  className="w-5 h-5 accent-accent"
                />
              </div>
              <div>
                <h4 className="font-semibold">Marketing-Zustimmung (Newsletter & SMS)</h4>
                <p className="text-sm text-muted-foreground mt-1 mb-2">
                  Der Kunde möchte Angebote und Benachrichtigungen per E-Mail oder SMS erhalten.
                </p>
                {customer.marketingConsentAt && marketing && (
                  <p className="text-xs text-green-600 font-medium">Zugegstimmt am: {format(new Date(customer.marketingConsentAt), "dd.MM.yyyy HH:mm")}</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function RepairCard({ repair }: { repair: any }) {
  return (
    <div className="bg-card border rounded-xl p-5 hover:bg-muted/10 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-3 border-b pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/repairs/${repair.id}`} className="font-mono font-bold text-lg text-foreground hover:text-accent">
              {repair.ticketNumber}
            </Link>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted border font-medium">
              {repair.status}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {repair.device?.manufacturer || repair.device?.model ? `${repair.device.manufacturer} ${repair.device.model}`.trim() : "Unbekanntes Gerät"}
          </p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Eingegangen am {format(new Date(repair.createdAt), "dd. MMMM yyyy", { locale: de })}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link 
            href={`/repairs/${repair.id}`}
            className="flex items-center justify-center gap-2 px-3 py-1.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Eye className="w-4 h-4" /> Ansehen
          </Link>
          <Link 
            href={`/print/${repair.id}`}
            target="_blank"
            className="flex items-center justify-center gap-2 px-3 py-1.5 border bg-background rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <Printer className="w-4 h-4" />
          </Link>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {repair.issues.map((issue: any) => (
          <span key={issue.id} className="text-[10px] uppercase tracking-wider font-semibold bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">
            {issue.issueType}
          </span>
        ))}
      </div>
    </div>
  );
}
