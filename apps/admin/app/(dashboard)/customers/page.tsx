import { prisma } from "@repo/database";
import { CustomersTableClient } from "../../../components/customers/CustomersTableClient";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { repairs: true }
      }
    }
  });

  const serializedCustomers = customers.map(customer => ({
    ...customer,
    totalSpending: customer.totalSpending ? customer.totalSpending.toString() : "0"
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kunden</h1>
          <p className="text-muted-foreground">Alle Kunden und ihre Kontaktdaten verwalten.</p>
        </div>
      </div>

      <CustomersTableClient initialCustomers={serializedCustomers} />
    </div>
  );
}
