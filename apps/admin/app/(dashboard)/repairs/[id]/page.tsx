import { prisma } from "@repo/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowLeft, User, Smartphone, AlertCircle, Wrench, ShieldCheck, History, Edit } from "lucide-react";
import StatusSelect from "./StatusSelect";
import PriceEditor from "./PriceEditor";
import { PrintButton } from "../../../../components/repairs/PrintButton";

export default async function RepairDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const repair = await prisma.repair.findUnique({
    where: { id },
    include: {
      customer: true,
      device: true,
      issues: true,
      conditionItems: true,
      statusHistory: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!repair) return notFound();

  const pastRepairs = await prisma.repair.findMany({
    where: { 
      customerId: repair.customerId,
      id: { not: repair.id }
    },
    include: {
      device: true,
      issues: true,
    },
    orderBy: { createdAt: "desc" }
  });

  const translateIssue = (type: string) => {
    switch (type) {
      case "DISPLAY": return "Display/Glas";
      case "BATTERY": return "Akku";
      case "CHARGING_PORT": return "Ladebuchse";
      case "CAMERA": return "Kamera";
      case "WATER_DAMAGE": return "Wasserschaden";
      case "BACK_COVER": return "Rückseite";
      case "SOFTWARE": return "Software";
      default: return type;
    }
  };

  const translateCondition = (cond: string) => {
    switch (cond) {
      case "SCREEN_SCRATCHES": return "Kratzer auf dem Display";
      case "CRACKED_SCREEN": return "Display gesprungen";
      case "BENT_FRAME": return "Rahmen verbogen";
      case "WATER_DAMAGE_VISIBLE": return "Wasserschaden sichtbar";
      default: return cond;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/repairs" className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-2 text-sm font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold">Ticket {repair.ticketNumber}</h1>
          </div>
          <p className="text-muted-foreground mt-1">Eingegangen am {format(new Date(repair.createdAt), "dd. MMMM yyyy 'um' HH:mm", { locale: de })}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <PrintButton repair={JSON.parse(JSON.stringify(repair))} />
          <StatusSelect repairId={repair.id} currentStatus={repair.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer & Device */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-medium flex items-center gap-2 mb-4 pb-2 border-b">
                <User className="h-5 w-5 text-accent" /> Kundendaten
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Name</span>
                  <span className="font-medium">{repair.customer.firstName || repair.customer.lastName ? `${repair.customer.firstName} ${repair.customer.lastName}`.trim() : "Unbekannter Kunde"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Kunden-ID</span>
                  <span className="font-medium font-mono text-accent">CUST-{repair.customer.id.slice(-6).toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Telefon</span>
                  <span className="font-medium">{repair.customer.phone || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Adresse</span>
                  <span className="font-medium">{repair.customer.street || repair.customer.postalCode || repair.customer.city ? `${repair.customer.street || ''}, ${repair.customer.postalCode || ''} ${repair.customer.city || ''}`.trim() : "-"}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-medium flex items-center gap-2 mb-4 pb-2 border-b">
                <Smartphone className="h-5 w-5 text-accent" /> Gerätedetails
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Modell</span>
                  <span className="font-medium">{repair.device?.manufacturer || repair.device?.model ? `${repair.device.manufacturer} ${repair.device.model}`.trim() : "Unbekanntes Gerät"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">IMEI / Seriennummer</span>
                  <span className="font-medium font-mono">{repair.device.imei || "Nicht angegeben"}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground block text-xs">Geräte-Passwort</span>
                    <span className="font-medium font-mono bg-muted px-2 py-0.5 rounded">{repair.devicePasswordEncrypted || "Keins"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">SIM-PIN</span>
                    <span className="font-medium font-mono bg-muted px-2 py-0.5 rounded">{repair.simPinEncrypted || "Keins"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Repair Title */}
          <div className="flex items-center gap-2 mt-8 mb-4">
            <h2 className="text-xl font-bold">Aktueller Auftrag</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">NEU</span>
          </div>

          {/* Problem & Condition */}
          <div className="bg-card border rounded-xl p-6 shadow-sm border-l-4 border-l-primary">
            <h2 className="text-lg font-medium flex items-center gap-2 mb-4 pb-2 border-b">
              <AlertCircle className="h-5 w-5 text-destructive" /> Gemeldete Probleme (Aktuell)
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {repair.issues.map(i => (
                <span key={i.id} className="px-3 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full text-sm font-medium">
                  {translateIssue(i.issueType)}
                </span>
              ))}
            </div>
            {repair.problemDescription && (
              <div className="bg-muted/50 p-4 rounded-lg text-sm">
                <span className="text-muted-foreground block text-xs mb-1">Zusätzliche Beschreibung:</span>
                {repair.problemDescription}
              </div>
            )}
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium flex items-center gap-2 mb-4 pb-2 border-b">
              <ShieldCheck className="h-5 w-5 text-green-500" /> Optischer Zustand
            </h2>
            <ul className="list-disc list-inside space-y-1 text-sm mb-4">
              {repair.conditionItems.length === 0 ? (
                <li className="text-muted-foreground list-none">Keine optischen Mängel gemeldet.</li>
              ) : (
                repair.conditionItems.map(c => (
                  <li key={c.id} className="text-foreground">{translateCondition(c.condition)}</li>
                ))
              )}
            </ul>
            {repair.conditionNotes && (
              <div className="bg-muted/50 p-4 rounded-lg text-sm mt-4">
                <span className="text-muted-foreground block text-xs mb-1">Notizen zum Zustand:</span>
                {repair.conditionNotes}
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-sm font-medium mb-3">Mitgebrachtes Zubehör</h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${repair.hasSimCard ? 'bg-green-500' : 'bg-muted'}`} /> SIM
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${repair.hasCase ? 'bg-green-500' : 'bg-muted'}`} /> Hülle
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${repair.hasCharger ? 'bg-green-500' : 'bg-muted'}`} /> Ladekabel
                </div>
              </div>
            </div>
          </div>
          
          {/* Past Repairs Section */}
          {pastRepairs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <History className="h-5 w-5" /> Vorherige Reparaturen ({pastRepairs.length})
              </h2>
              <div className="space-y-4">
                {pastRepairs.map(past => (
                  <div key={past.id} className="bg-muted/30 border rounded-xl p-5 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link href={`/repairs/${past.id}`} className="font-mono font-bold text-foreground hover:text-accent flex items-center gap-2">
                          {past.ticketNumber}
                          <span className="text-xs px-2 py-0.5 rounded-full bg-background border font-medium">
                            {past.status}
                          </span>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(past.createdAt), "dd.MM.yyyy")} - {past.device.manufacturer} {past.device.model}
                        </p>
                      </div>
                      <Link href={`/repairs/${past.id}`} className="px-3 py-1.5 bg-background border rounded-lg text-xs font-medium hover:bg-muted">
                        Ansehen
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {past.issues.map(issue => (
                        <span key={issue.id} className="text-[10px] uppercase tracking-wider font-semibold bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">
                          {translateIssue(issue.issueType)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          
          {/* Price Calculator */}
          <PriceEditor 
            repairId={repair.id} 
            currentPrice={repair.estimatedPrice ? Number(repair.estimatedPrice) : null}
            currentPickupDate={repair.pickupDate ? new Date(repair.pickupDate).toISOString().slice(0, 16) : null}
          />

          {/* Signature */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium flex items-center gap-2 mb-4 pb-2 border-b">
              <Edit className="h-5 w-5 text-accent" /> Kundenunterschrift
            </h2>
            {repair.signatureImage ? (
              <div className="bg-white rounded-lg p-2 border">
                <img src={repair.signatureImage} alt="Kundenunterschrift" className="w-full h-auto object-contain filter invert" />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-8 text-center border border-dashed rounded-lg">
                Keine Unterschrift vorhanden
              </div>
            )}
            {repair.termsAccepted && (
              <p className="text-xs text-green-500 mt-3 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3" /> AGB & Datenschutz akzeptiert
              </p>
            )}
          </div>

          {/* Status History */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium flex items-center gap-2 mb-4 pb-2 border-b">
              <History className="h-5 w-5 text-muted-foreground" /> Historie
            </h2>
            <div className="space-y-4">
              <div className="relative pl-4 border-l-2 border-accent/30 pb-4">
                <div className="absolute w-2.5 h-2.5 bg-accent rounded-full -left-[6px] top-1.5" />
                <p className="text-sm font-medium">{repair.status}</p>
                <p className="text-xs text-muted-foreground mt-1">Aktueller Status</p>
              </div>
              
              {repair.statusHistory.map(history => (
                <div key={history.id} className="relative pl-4 border-l-2 border-muted pb-4 last:border-0 last:pb-0">
                  <div className="absolute w-2 h-2 bg-muted-foreground rounded-full -left-[5px] top-1.5" />
                  <p className="text-sm font-medium text-muted-foreground">{history.status}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(history.createdAt), "dd.MM.yyyy HH:mm")}
                  </p>
                  {history.note && <p className="text-xs mt-1 text-muted-foreground italic">{history.note}</p>}
                </div>
              ))}

              <div className="relative pl-4">
                <div className="absolute w-2 h-2 bg-muted-foreground rounded-full -left-[5px] top-1.5" />
                <p className="text-sm font-medium text-muted-foreground">Ticket erstellt</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(repair.createdAt), "dd.MM.yyyy HH:mm")}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
