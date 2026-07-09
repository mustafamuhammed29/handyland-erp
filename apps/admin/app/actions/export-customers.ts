"use server";

import { prisma } from "@repo/database";

export async function exportCustomersToCSV(filters?: {
  tier?: string;
  marketingConsent?: boolean;
}) {
  const whereClause: any = {};
  
  if (filters?.tier) {
    whereClause.loyaltyTier = filters.tier;
  }
  
  if (filters?.marketingConsent !== undefined) {
    whereClause.marketingConsent = filters.marketingConsent;
  }

  const customers = await prisma.customer.findMany({
    where: whereClause,
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      loyaltyTier: true,
      totalSpending: true,
      totalRepairs: true,
      marketingConsent: true,
    },
    orderBy: {
      totalSpending: 'desc'
    }
  });

  const headers = ['Vorname', 'Nachname', 'Email', 'Telefon', 'Level', 'Umsatz', 'Reparaturen', 'Marketing_Aktiv'];
  
  const csvRows = [
    headers.join(','),
    ...customers.map(c => 
      [
        `"${c.firstName || ''}"`,
        `"${c.lastName || ''}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        c.loyaltyTier,
        c.totalSpending,
        c.totalRepairs,
        c.marketingConsent ? 'Ja' : 'Nein'
      ].join(',')
    )
  ];

  return csvRows.join('\n');
}
