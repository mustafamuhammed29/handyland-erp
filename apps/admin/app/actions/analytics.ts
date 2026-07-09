"use server";

import { prisma } from "@repo/database";

export async function getAnalyticsData(startDateStr: string, endDateStr: string) {
  try {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);

    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      }
    };

    // 1. Revenue & Repair Volume
    const repairsInRange = await prisma.repair.findMany({
      where: dateFilter,
      select: {
        id: true,
        finalPrice: true,
        status: true,
        createdAt: true,
        issues: { select: { issueType: true } }
      }
    });

    let totalRevenue = 0;
    let completedRepairs = 0;

    const volumeByDay: Record<string, number> = {};
    const revenueByDay: Record<string, number> = {};
    const issueDistribution: Record<string, number> = {};

    repairsInRange.forEach(repair => {
      const dateStr = repair.createdAt.toISOString().split("T")[0];
      
      volumeByDay[dateStr] = (volumeByDay[dateStr] || 0) + 1;
      
      if (repair.status === "DELIVERED") {
        completedRepairs++;
        if (repair.finalPrice) {
          const val = Number(repair.finalPrice);
          totalRevenue += val;
          revenueByDay[dateStr] = (revenueByDay[dateStr] || 0) + val;
        }
      }

      repair.issues.forEach(issue => {
        issueDistribution[issue.issueType] = (issueDistribution[issue.issueType] || 0) + 1;
      });
    });

    // Sort chart data
    const chartData = Object.keys(volumeByDay).sort().map(date => ({
      date,
      volume: volumeByDay[date],
      revenue: revenueByDay[date] || 0
    }));

    // Top issues
    const topIssues = Object.entries(issueDistribution)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));

    // 2. Returning Customers
    // For returning customers, we want to see how many unique customers created a ticket in this period
    // who also have a ticket prior to this period (or just more than 1 ticket overall).
    // A strict definition: customers in this period whose total ticket count is > 1.
    const customersInPeriod = [...new Set(repairsInRange.map(r => r.id))]; // Wait, we need customerId. We didn't select it above.
    
    const repairsWithCustomers = await prisma.repair.findMany({
      where: dateFilter,
      select: { customerId: true }
    });
    
    const uniqueCustomerIds = [...new Set(repairsWithCustomers.map(r => r.customerId))];
    
    const returningCustomersCount = await prisma.customer.count({
      where: {
        id: { in: uniqueCustomerIds },
        repairs: {
          // Has more than 1 repair
          some: {
            id: { not: "" }
          }
        }
      }
    });
    // Actually the above Prisma query is tricky. Let's just fetch the repair counts for these customers.
    const customerStats = await prisma.customer.findMany({
      where: { id: { in: uniqueCustomerIds } },
      select: {
        id: true,
        _count: { select: { repairs: true } }
      }
    });
    
    const returningCount = customerStats.filter(c => c._count.repairs > 1).length;
    const returningPercentage = uniqueCustomerIds.length > 0 
      ? Math.round((returningCount / uniqueCustomerIds.length) * 100) 
      : 0;

    // 3. Technician Performance
    const technicianRepairs = await prisma.repair.findMany({
      where: {
        ...dateFilter,
        assignedToId: { not: null },
        status: "DELIVERED"
      },
      select: {
        assignedTo: { select: { id: true, name: true } },
        finalPrice: true
      }
    });

    const techStatsMap: Record<string, { name: string, completed: number, revenue: number }> = {};
    technicianRepairs.forEach(r => {
      if (!r.assignedTo) return;
      const techId = r.assignedTo.id;
      if (!techStatsMap[techId]) {
        techStatsMap[techId] = { name: r.assignedTo.name, completed: 0, revenue: 0 };
      }
      techStatsMap[techId].completed += 1;
      if (r.finalPrice) {
        techStatsMap[techId].revenue += Number(r.finalPrice);
      }
    });

    const technicianStats = Object.values(techStatsMap).sort((a, b) => b.completed - a.completed);

    // Provide a small summary object
    const summary = {
      totalRevenue,
      totalRepairs: repairsInRange.length,
      completedRepairs,
      returningPercentage
    };

    return {
      success: true,
      data: {
        summary,
        chartData,
        topIssues,
        technicianStats
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
