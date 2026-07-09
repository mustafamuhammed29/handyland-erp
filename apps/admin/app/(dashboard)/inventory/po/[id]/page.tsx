import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import { PoDetailClient } from "../../../../../components/inventory/PoDetailClient";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: {
          part: true
        }
      }
    }
  });

  if (!po) return notFound();

  const serializedPo = {
    id: po.id,
    orderNumber: po.orderNumber,
    status: po.status,
    createdAt: po.createdAt.toISOString(),
    orderedAt: po.orderedAt?.toISOString() ?? null,
    receivedAt: po.receivedAt?.toISOString() ?? null,
    supplier: {
      id: po.supplier.id,
      name: po.supplier.name,
      email: po.supplier.email ?? null,
      phone: po.supplier.phone ?? null,
    },
    items: po.items.map(item => ({
      id: item.id,
      partId: item.partId,
      partName: item.partName,
      quantity: item.quantity,
      receivedQuantity: item.receivedQuantity,
      cost: item.cost ? item.cost.toString() : null,
      notes: item.notes ?? null,
    }))
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/inventory/po" className="p-2 border rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold tracking-tight">Bestellung {po.orderNumber}</h1>
          <p className="text-muted-foreground">Lieferant: {po.supplier.name}</p>
        </div>
        <Link 
          href={`/print/po/${po.id}`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-card border rounded-lg hover:bg-muted font-medium transition-colors"
        >
          <Printer className="w-4 h-4" />
          PDF Drucken
        </Link>
      </div>

      <PoDetailClient po={serializedPo} />
    </div>
  );
}
