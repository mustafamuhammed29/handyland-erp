import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import { CustomerEditForm } from "./CustomerEditForm"; // Re-export check

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) return notFound();

  // Convert Decimals to strings for the client component
  const serializedCustomer = {
    ...customer,
    totalSpending: customer.totalSpending ? customer.totalSpending.toString() : "0",
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kunde bearbeiten</h1>
        <p className="text-muted-foreground">Aktualisieren Sie die persönlichen Daten des Kunden.</p>
      </div>

      <div className="border rounded-lg bg-card p-6 shadow-sm">
        <CustomerEditForm customer={serializedCustomer} />
      </div>
    </div>
  );
}
