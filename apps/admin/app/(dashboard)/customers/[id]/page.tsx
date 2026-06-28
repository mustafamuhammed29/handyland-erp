import { prisma } from "@repo/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowLeft, User, Phone, MapPin, Calendar, Smartphone, Eye, Printer, History } from "lucide-react";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      repairs: {
        include: { device: true, issues: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!customer) return notFound();

  const activeRepairs = customer.repairs.filter(r => !["DELIVERED", "CANCELLED"].includes(r.status));
  const pastRepairs = customer.repairs.filter(r => ["DELIVERED", "CANCELLED"].includes(r.status));

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

  const renderRepairList = (repairs: typeof activeRepairs, emptyMessage: string) => {
    if (repairs.length === 0) {
      return (
        <div className="text-center p-8 border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {repairs.map(repair => (
          <div key={repair.id} className="bg-card border rounded-xl p-5 hover:bg-muted/10 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 border-b pb-4">
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
              <div className="flex sm:flex-col gap-2 shrink-0">
                <Link 
                  href={`/repairs/${repair.id}`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Eye className="w-4 h-4" /> Ansehen
                </Link>
                <Link 
                  href={`/print/${repair.id}`}
                  target="_blank"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 border bg-background rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Printer className="w-4 h-4" /> Drucken
                </Link>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {repair.issues.map(issue => (
                <span key={issue.id} className="text-xs uppercase tracking-wider font-semibold bg-red-500/10 text-red-500 px-2 py-1 rounded">
                  {translateIssue(issue.issueType)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-2 text-sm font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" /> Zurück zum Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">
                {customer.firstName || customer.lastName ? `${customer.firstName} ${customer.lastName}`.trim() : "Unbekannter Kunde"}
              </h1>
              <p className="text-muted-foreground font-mono mt-1 text-sm">
                Kunden-ID: CUST-{customer.id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar: Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium flex items-center gap-2 mb-4 pb-2 border-b">
              Kontaktdaten
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block text-xs">Telefon</span>
                  <span className="font-medium">{customer.phone || "-"}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block text-xs">Adresse</span>
                  <span className="font-medium">
                    {customer.street || customer.postalCode || customer.city 
                      ? `${customer.street || ''}, ${customer.postalCode || ''} ${customer.city || ''}`.trim() 
                      : "-"}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block text-xs">Kunde seit</span>
                  <span className="font-medium">{format(new Date(customer.createdAt), "dd.MM.yyyy")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium text-accent flex items-center gap-2 mb-2">
              Reparatur-Statistik
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-4 text-center">
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-2xl font-bold">{activeRepairs.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Aktiv</p>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-2xl font-bold">{pastRepairs.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Abgeschlossen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Repair Lists */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-primary" /> Aktuelle Reparaturen
              {activeRepairs.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold ml-2">
                  {activeRepairs.length}
                </span>
              )}
            </h2>
            {renderRepairList(activeRepairs, "Keine aktiven Reparaturen.")}
          </section>

          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-muted-foreground" /> Vorherige Reparaturen
              {pastRepairs.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-muted border text-muted-foreground text-xs font-semibold ml-2">
                  {pastRepairs.length}
                </span>
              )}
            </h2>
            {renderRepairList(pastRepairs, "Bisher keine abgeschlossenen Reparaturen.")}
          </section>

        </div>
      </div>
    </div>
  );
}
