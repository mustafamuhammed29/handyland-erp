import { prisma } from "@repo/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Phone, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { CustomerCrmClient } from "../../../../components/customers/CustomerCrmClient";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      repairs: {
        include: { device: true, issues: true },
        orderBy: { createdAt: "desc" }
      },
      devices: true,
      notes: {
        include: { staff: { select: { name: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!customer) return notFound();

  // Serialize dates for Client Component
  const serializedCustomer = {
    ...customer,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    gdprConsentAt: customer.gdprConsentAt?.toISOString() || null,
    marketingConsentAt: customer.marketingConsentAt?.toISOString() || null,
    totalSpending: customer.totalSpending ? customer.totalSpending.toString() : "0",
    repairs: customer.repairs.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      pickupDate: r.pickupDate?.toISOString() || null,
      signatureTimestamp: r.signatureTimestamp?.toISOString() || null,
      estimatedPrice: r.estimatedPrice ? r.estimatedPrice.toString() : null,
      finalPrice: r.finalPrice ? r.finalPrice.toString() : null,
    })),
    devices: customer.devices.map(d => ({
      ...d,
      createdAt: d.createdAt.toISOString()
    })),
    notes: customer.notes.map(n => ({
      ...n,
      createdAt: n.createdAt.toISOString()
    }))
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/customers" className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-2 text-sm font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" /> Zurück zur Kundenliste
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <User className="w-7 h-7" />
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar: Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">
              Kontaktdaten
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Telefon</span>
                  <span className="font-medium">{customer.phone || "-"}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Adresse</span>
                  <span className="font-medium">
                    {customer.street || customer.postalCode || customer.city 
                      ? `${customer.street || ''}\n${customer.postalCode || ''} ${customer.city || ''}`.trim() 
                      : "-"}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Kunde seit</span>
                  <span className="font-medium">{format(new Date(customer.createdAt), "dd.MM.yyyy")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main CRM Content */}
        <div className="lg:col-span-3">
          <CustomerCrmClient customer={serializedCustomer} />
        </div>

      </div>
    </div>
  );
}
