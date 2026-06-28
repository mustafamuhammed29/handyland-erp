import { prisma } from "@repo/database";
import AnalyticsClient from "./AnalyticsClient";
import { startOfMonth, subDays, format, startOfYear, subMonths } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  
  // 1. KPI Data
  const repairsThisMonth = await prisma.repair.count({
    where: { createdAt: { gte: startOfCurrentMonth } }
  });

  const revenueResult = await prisma.repair.aggregate({
    _sum: { estimatedPrice: true },
    where: { 
      createdAt: { gte: startOfCurrentMonth },
      status: { in: ["DELIVERED", "READY_FOR_PICKUP"] }
    }
  });
  const revenueThisMonth = Number(revenueResult._sum.estimatedPrice || 0);

  // Customers logic: returning vs new
  const customersThisMonth = await prisma.customer.findMany({
    where: { createdAt: { gte: startOfCurrentMonth } },
    select: { id: true, totalRepairs: true }
  });
  
  const newCustomers = customersThisMonth.filter(c => c.totalRepairs <= 1).length;
  const returningCustomers = customersThisMonth.filter(c => c.totalRepairs > 1).length;

  // 2. Bar chart: Repairs per day (last 7 days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(now, 6 - i);
    d.setHours(0,0,0,0);
    return d;
  });

  const repairsPerDayData = await Promise.all(
    last7Days.map(async (day) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const count = await prisma.repair.count({
        where: { createdAt: { gte: day, lt: nextDay } }
      });
      return {
        name: format(day, "EEE"),
        Repairs: count
      };
    })
  );

  // 3. Donut chart: Most common repair issues
  const allIssues = await prisma.repairIssue.findMany({
    select: { issueType: true }
  });
  const issueCounts: Record<string, number> = {};
  allIssues.forEach((i: { issueType: string }) => {
    issueCounts[i.issueType] = (issueCounts[i.issueType] || 0) + 1;
  });
  const issuesData = Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // 4. Line chart: Monthly revenue trend (Last 6 months)
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    return startOfMonth(subMonths(now, 5 - i));
  });

  const revenueTrendData = await Promise.all(
    last6Months.map(async (monthStart) => {
      const nextMonth = new Date(monthStart);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const rev = await prisma.repair.aggregate({
        _sum: { estimatedPrice: true },
        where: { 
          createdAt: { gte: monthStart, lt: nextMonth },
          status: { in: ["DELIVERED", "READY_FOR_PICKUP"] }
        }
      });
      return {
        name: format(monthStart, "MMM"),
        Revenue: Number(rev._sum.estimatedPrice || 0)
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Detaillierte Einblicke in Ihre Geschäftsleistung.</p>
      </div>

      <AnalyticsClient 
        kpis={{ repairsThisMonth, revenueThisMonth, newCustomers, returningCustomers }}
        repairsPerDay={repairsPerDayData}
        issuesData={issuesData}
        revenueTrend={revenueTrendData}
      />
    </div>
  );
}
