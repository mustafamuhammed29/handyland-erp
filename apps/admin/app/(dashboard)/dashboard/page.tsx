import { prisma } from "@repo/database";
import Link from "next/link";
import { 
  Wrench, 
  Banknote, 
  Clock, 
  PackageCheck,
  Users,
  Printer,
  Eye,
  Smartphone
} from "lucide-react";
import { AnimatedCounter } from "../../../components/dashboard/AnimatedCounter";

export default async function DashboardHome() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch real stats from the database
  const [
    repairsToday,
    openRepairs,
    readyRepairs,
    newCustomersToday,
    recentActivity,
    revenueResult
  ] = await Promise.all([
    prisma.repair.count({ where: { createdAt: { gte: today } } }),
    prisma.repair.count({ where: { status: { notIn: ["DELIVERED", "CANCELLED"] } } }),
    prisma.repair.count({ where: { status: "READY_FOR_PICKUP" } }),
    prisma.customer.count({ where: { createdAt: { gte: today } } }),
    prisma.repair.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: true, device: true, issues: true }
    }),
    prisma.repair.aggregate({
      _sum: { estimatedPrice: true },
      where: { 
        estimatedPrice: { not: null },
        status: { in: ["DELIVERED", "READY_FOR_PICKUP"] }
      }
    })
  ]);

  const totalRevenue = revenueResult._sum.estimatedPrice 
    ? Number(revenueResult._sum.estimatedPrice).toFixed(2) 
    : "0.00";

  const stats = [
    { name: 'Repairs Today', value: repairsToday.toString(), icon: Wrench, change: 'Heute', changeType: 'neutral' },
    { name: 'Revenue', value: `€${totalRevenue}`, icon: Banknote, change: 'Gesamtumsatz', changeType: 'positive' },
    { name: 'Open Repairs', value: openRepairs.toString(), icon: Clock, change: 'Aktiv', changeType: 'positive' },
    { name: 'Ready for Pickup', value: readyRepairs.toString(), icon: PackageCheck, change: 'Abholbereit', changeType: 'positive' },
    { name: 'New Customers', value: newCustomersToday.toString(), icon: Users, change: 'Heute', changeType: 'neutral' },
  ];

  // Group recentActivity by customer
  type GroupedActivity = { customer: any, repairs: any[] };
  const groupedCustomersMap = new Map<string, GroupedActivity>();
  recentActivity.forEach(activity => {
    if (!groupedCustomersMap.has(activity.customer.id)) {
      groupedCustomersMap.set(activity.customer.id, {
        customer: activity.customer,
        repairs: []
      });
    }
    groupedCustomersMap.get(activity.customer.id)!.repairs.push(activity);
  });
  
  const groupedActivity = Array.from(groupedCustomersMap.values());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Echtzeit-Übersicht Ihrer Shop-Aktivitäten.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-card border rounded-xl p-6 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{stat.name}</span>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">
                <AnimatedCounter value={stat.value} isCurrency={stat.name === 'Revenue'} />
              </span>
              <span className={`text-xs font-medium flex items-center ${
                stat.changeType === 'positive' ? 'text-green-500' : 'text-muted-foreground'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Real Recent Activity (Taking 2 columns) */}
        <div className="bg-card border rounded-xl p-6 shadow-sm lg:col-span-2 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Letzte Reparaturaufträge</h2>
            <Link href="/repairs" className="text-sm text-accent hover:underline">Alle ansehen</Link>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            {groupedActivity.length === 0 ? (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/20 text-muted-foreground text-sm">
                Noch keine Aufträge vorhanden.
              </div>
            ) : (
              groupedActivity.map(({ customer, repairs }) => (
                <div key={customer.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/customers/${customer.id}`} className="font-bold text-lg text-foreground hover:text-accent flex items-center gap-2">
                          {customer.firstName || customer.lastName ? `${customer.firstName} ${customer.lastName}`.trim() : "Unbekannter Kunde"}
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted border font-medium text-muted-foreground">
                            CUST-{customer.id.slice(-6).toUpperCase()}
                          </span>
                        </Link>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {customer.phone ? customer.phone : "Keine Telefonnummer"}
                      </p>
                      
                      <div className="flex gap-2 mt-3 flex-wrap">
                         {repairs.map(repair => (
                           <Link key={repair.id} href={`/repairs/${repair.id}`} className="text-xs bg-background border border-border/50 px-2.5 py-1.5 rounded-md hover:border-accent hover:text-accent transition-colors flex items-center gap-1.5">
                             <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                             <span className="font-medium">{repair.ticketNumber}</span>
                           </Link>
                         ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <Link 
                      href={`/customers/${customer.id}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <Eye className="w-4 h-4" /> Kundenakte
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Placeholder for Revenue Chart */}
        <div className="bg-card border rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Umsatz-Trend</h2>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/20">
            <span className="text-muted-foreground text-center px-4">Diagramm wird nach ersten Zahlungen generiert</span>
          </div>
        </div>
      </div>
    </div>
  );
}
