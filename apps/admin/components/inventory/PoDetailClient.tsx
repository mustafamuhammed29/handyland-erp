"use client";

import { useState } from "react";
import { CheckCircle2, Box, Info } from "lucide-react";
import { updatePurchaseOrderStatus, receivePurchaseOrderItem } from "../../app/actions/po";

type PoDetailClientProps = {
  po: {
    id: string;
    orderNumber: string;
    status: string;
    supplier: { id: string; name: string; email: string | null; phone: string | null };
    items: {
      id: string;
      partId: string | null;
      partName: string;
      quantity: number;
      receivedQuantity: number;
      cost: string | null;
    }[];
  }
};

export function PoDetailClient({ po }: PoDetailClientProps) {
  const [status, setStatus] = useState(po.status);
  const [items, setItems] = useState(po.items);
  const [receiveAmounts, setReceiveAmounts] = useState<Record<string, number>>({});

  const handleStatusChange = async (newStatus: "DRAFT" | "ORDERED" | "PARTIALLY_RECEIVED" | "DELIVERED" | "CANCELLED") => {
    const res = await updatePurchaseOrderStatus(po.id, newStatus);
    if (res.success) {
      setStatus(newStatus);
    }
  };

  const handleReceive = async (itemId: string, max: number) => {
    const amount = receiveAmounts[itemId] || 0;
    if (amount <= 0 || amount > max) return;

    const res = await receivePurchaseOrderItem(po.id, itemId, amount);
    if (res.success) {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, receivedQuantity: i.receivedQuantity + amount } : i));
      setReceiveAmounts(prev => ({ ...prev, [itemId]: 0 }));
    }
  };

  const isDelivered = status === "DELIVERED";
  const isCancelled = status === "CANCELLED";
  const isActive = status !== "DRAFT" && !isDelivered && !isCancelled;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Box className="w-5 h-5" /> Artikel
            </h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/10 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Bezeichnung</th>
                <th className="px-4 py-3 font-medium">Menge (Bestellt)</th>
                <th className="px-4 py-3 font-medium">Erhalten</th>
                <th className="px-4 py-3 font-medium">Kosten (Ea)</th>
                <th className="px-4 py-3 font-medium text-right">Wareneingang</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const pending = item.quantity - item.receivedQuantity;
                const isFullyReceived = pending <= 0;
                return (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/10">
                    <td className="px-4 py-3 font-medium">{item.partName}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">
                      <span className={isFullyReceived ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                        {item.receivedQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.cost ? `€${parseFloat(item.cost).toFixed(2)}` : "-"}</td>
                    <td className="px-4 py-3 text-right">
                      {isFullyReceived ? (
                        <div className="flex items-center justify-end gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Komplett
                        </div>
                      ) : isActive ? (
                        <div className="flex items-center justify-end gap-2">
                          <input 
                            type="number"
                            min="1"
                            max={pending}
                            value={receiveAmounts[item.id] || ""}
                            onChange={(e) => setReceiveAmounts(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                            className="w-16 p-1 text-sm border rounded"
                            placeholder={pending.toString()}
                          />
                          <button 
                            onClick={() => handleReceive(item.id, pending)}
                            className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-xs font-medium transition-colors"
                          >
                            Einbuchen
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Nicht aktiv</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card border rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Status</h3>
          <select 
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="w-full p-2 border rounded-md font-medium"
          >
            <option value="DRAFT">Entwurf (Draft)</option>
            <option value="ORDERED">Bestellt (Ordered)</option>
            <option value="PARTIALLY_RECEIVED">Teilweise geliefert</option>
            <option value="DELIVERED">Vollständig geliefert</option>
            <option value="CANCELLED">Storniert</option>
          </select>
          {isActive && (
             <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex gap-2 items-start mt-4">
               <Info className="w-4 h-4 mt-0.5 shrink-0" />
               <p>Du kannst nun Wareneingänge buchen. Die Artikel werden automatisch zum Lagerbestand hinzugefügt.</p>
             </div>
          )}
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-5 space-y-3">
          <h3 className="font-semibold text-lg border-b pb-2">Lieferant Info</h3>
          <div>
            <div className="text-sm text-muted-foreground">Name</div>
            <div className="font-medium">{po.supplier.name}</div>
          </div>
          {po.supplier.email && (
            <div>
              <div className="text-sm text-muted-foreground">E-Mail</div>
              <a href={`mailto:${po.supplier.email}`} className="text-blue-600 hover:underline">{po.supplier.email}</a>
            </div>
          )}
          {po.supplier.phone && (
            <div>
              <div className="text-sm text-muted-foreground">Telefon</div>
              <div>{po.supplier.phone}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
