import { prisma } from "@repo/database";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PoPrintPage({ params }: { params: Promise<{ id: string }> }) {
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

  const settings = await prisma.shopSettings.findUnique({ where: { id: "singleton" } });
  const shopName = settings?.shopName || "HANDYLAND";

  return (
    <div className="bg-white text-black min-h-screen p-8 max-w-4xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-wider">{shopName}</h1>
          <p className="text-gray-600 mt-2 text-sm">{settings?.address || "Musterstraße 1, 12345 Berlin"}</p>
          <p className="text-gray-600 text-sm">{settings?.phone || "+49 123 456 789"}</p>
          <p className="text-gray-600 text-sm">{settings?.email || "info@handyland.de"}</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-gray-800 uppercase">Bestellung</h2>
          <p className="text-lg font-medium mt-1">{po.orderNumber}</p>
          <p className="text-gray-600 mt-1">Datum: {new Date(po.createdAt).toLocaleDateString('de-DE')}</p>
        </div>
      </div>

      {/* Supplier Info */}
      <div className="mb-10">
        <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-2">An (Lieferant)</h3>
        <p className="text-xl font-bold">{po.supplier.name}</p>
        {po.supplier.address && <p>{po.supplier.address}</p>}
        {po.supplier.phone && <p>{po.supplier.phone}</p>}
        {po.supplier.email && <p>{po.supplier.email}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full text-left mb-10 border-collapse">
        <thead>
          <tr className="border-b-2 border-black text-sm uppercase tracking-wider text-gray-600">
            <th className="py-3 px-2">Artikel / Teil</th>
            <th className="py-3 px-2">Marke / Modell</th>
            <th className="py-3 px-2">Eigenschaften</th>
            <th className="py-3 px-2 text-right">Menge</th>
            <th className="py-3 px-2">Notizen</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {po.items.map((item, idx) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-4 px-2 font-medium">{item.partName}</td>
              <td className="py-4 px-2 text-gray-600">
                {item.part?.brand || "-"} / {item.part?.deviceModel || "-"}
              </td>
              <td className="py-4 px-2 text-gray-600">
                Qualität: {item.part?.quality || "-"}<br/>
                Farbe: {item.part?.color || "-"}
              </td>
              <td className="py-4 px-2 text-right font-bold text-lg">{item.quantity}</td>
              <td className="py-4 px-2 text-gray-500 text-xs">{item.notes || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer / Notes */}
      <div className="border-t-2 border-gray-200 pt-6">
        <h4 className="font-bold text-sm mb-2">Anmerkungen zur Bestellung:</h4>
        <p className="text-sm text-gray-600">
          Bitte liefern Sie die oben genannten Artikel so schnell wie möglich an unsere Adresse. 
          Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.
        </p>
      </div>

      {/* Auto-print script for PDF */}
      <script dangerouslySetInnerHTML={{ __html: "window.onload = function() { window.print(); }" }} />
    </div>
  );
}
