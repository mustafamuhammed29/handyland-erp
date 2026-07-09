import { prisma } from "@repo/database";
import { PosClient } from "../../../components/pos/PosClient";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  // Fetch all parts that can be sold directly (price > 0 and available stock)
  // Usually accessories or simple parts. We just load everything to the client for fast searching.
  const parts = await prisma.part.findMany({
    orderBy: { category: "asc" },
  });

  const serializedParts = parts.map(p => ({
    ...p,
    price: p.price.toString(),
    cost: p.cost ? p.cost.toString() : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Kasse (Direktverkauf)</h1>
        <p className="text-muted-foreground">Schneller Verkauf von Zubehör und Ersatzteilen ohne Reparaturticket.</p>
      </div>

      <PosClient initialParts={serializedParts} />
    </div>
  );
}
