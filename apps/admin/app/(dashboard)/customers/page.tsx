import { prisma } from "@repo/database";
import { CustomerTable } from "../../../components/customers/customer-table";
import { ExportButton } from "../../../components/customers/export-button";
import { Users, Crown, Banknote, TrendingUp } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function StatCard({ label, value, icon: Icon, highlight = false }: { label: string, value: string | number, icon: any, highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-xl shadow-sm border ${highlight ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-purple-100' : 'bg-white border-gray-100'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <h3 className={`text-2xl font-bold ${highlight ? 'text-purple-700' : 'text-gray-900'}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${highlight ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-400'}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default async function CustomersPage(props: { searchParams: Promise<{ search?: string; tier?: string; page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || '1');
  const perPage = 50;

  // Build filter criteria
  const whereClause = {
    AND: [
      searchParams.search
        ? {
            OR: [
              { firstName: { contains: searchParams.search, mode: "insensitive" } },
              { lastName: { contains: searchParams.search, mode: "insensitive" } },
              { phone: { contains: searchParams.search } },
              { email: { contains: searchParams.search, mode: "insensitive" } },
            ],
          }
        : {},
      searchParams.tier ? { loyaltyTier: searchParams.tier as any } : {},
    ]
  };

  // Fetch overview stats
  const stats = await prisma.$queryRaw<any[]>`
    SELECT 
      COUNT(*) as total_customers,
      COUNT(*) FILTER (WHERE "loyaltyTier" = 'VIP') as vip_count,
      SUM("totalSpending") as lifetime_revenue,
      AVG("totalSpending") as avg_customer_value
    FROM "Customer"
  `;

  const [customers, totalCount] = await Promise.all([
    prisma.customer.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { repairs: true, devices: true },
        },
      },
      orderBy: { totalSpending: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.customer.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kunden (CRM)</h1>
          <p className="text-gray-500 mt-1">Verwalten Sie Ihre Kunden, sehen Sie Umsätze und Level ein.</p>
        </div>
        <ExportButton />
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Alle Kunden"
          value={Number(stats[0]?.total_customers || 0)}
          icon={Users}
        />
        <StatCard
          label="VIP Kunden"
          value={Number(stats[0]?.vip_count || 0)}
          icon={Crown}
          highlight
        />
        <StatCard
          label="Gesamtumsatz"
          value={`€${Number(stats[0]?.lifetime_revenue || 0).toFixed(2)}`}
          icon={Banknote}
        />
        <StatCard
          label="Ø Kundenwert"
          value={`€${Number(stats[0]?.avg_customer_value || 0).toFixed(2)}`}
          icon={TrendingUp}
        />
      </div>

      <div className="flex gap-4 items-center">
        {/* Simple search UI placeholder - Ideally a client component */}
        <div className="flex-1 max-w-md">
          <input 
            type="text" 
            placeholder="Kunden suchen..." 
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            defaultValue={searchParams.search}
            // In a real implementation this would push to the router on change
          />
        </div>
      </div>

      <CustomerTable customers={customers} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Link href={`?page=${Math.max(1, page - 1)}`} className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50">Zurück</Link>
          <span className="px-4 py-2 flex items-center">Seite {page} von {totalPages}</span>
          <Link href={`?page=${Math.min(totalPages, page + 1)}`} className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50">Weiter</Link>
        </div>
      )}
    </div>
  );
}
