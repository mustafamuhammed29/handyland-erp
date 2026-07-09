"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, FileText, Truck, ArrowRight, Printer } from "lucide-react";
import { createPurchaseOrder, updatePurchaseOrderStatus } from "../../app/actions/po";

type PO = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  supplier: { id: string; name: string };
  itemsCount: number;
  totalQuantity: number;
  receivedQuantity: number;
};

export function PoClient({ initialOrders, suppliers, parts }: { 
  initialOrders: PO[], 
  suppliers: {id:string, name:string}[],
  parts: {id:string, name:string, category:string|null, deviceModel:string|null}[]
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newPoSupplier, setNewPoSupplier] = useState(suppliers[0]?.id || "");
  const [newPoItems, setNewPoItems] = useState<{partId: string, quantity: number, cost: string}[]>([]);

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.supplier.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newPoSupplier || newPoItems.length === 0) return;
    
    const items = newPoItems.map(item => {
      const part = parts.find(p => p.id === item.partId);
      return {
        partId: item.partId,
        partName: part ? part.name : "Unbekanntes Teil",
        quantity: item.quantity,
        cost: item.cost ? parseFloat(item.cost) : undefined
      };
    });

    const res = await createPurchaseOrder(newPoSupplier, items);
    if (res.success && res.po) {
      window.location.reload(); // Quick refresh to get new data
    } else {
      alert("Fehler beim Erstellen der Bestellung.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "DRAFT": return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">Entwurf</span>;
      case "ORDERED": return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">Bestellt</span>;
      case "PARTIALLY_RECEIVED": return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-medium">Teilweise geliefert</span>;
      case "DELIVERED": return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Vollständig</span>;
      case "CANCELLED": return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">Storniert</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Nach PO-Nummer oder Lieferant suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-sm"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Neue Bestellung
        </button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Bestellnummer</th>
              <th className="px-4 py-3 font-medium">Lieferant</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Fortschritt</th>
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  {order.supplier.name}
                </td>
                <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                <td className="px-4 py-3">
                  <div className="text-xs text-muted-foreground mb-1">
                    {order.receivedQuantity} von {order.totalQuantity} erhalten
                  </div>
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400" 
                      style={{ width: `${order.totalQuantity > 0 ? (order.receivedQuantity / order.totalQuantity) * 100 : 0}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('de-DE')}
                </td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <Link 
                    href={`/print/po/${order.id}`}
                    target="_blank"
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    title="PDF Drucken"
                  >
                    <Printer className="w-4 h-4" />
                  </Link>
                  <Link 
                    href={`/inventory/po/${order.id}`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Keine Bestellungen gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-lg border flex flex-col max-h-[90vh]">
            <div className="p-4 border-b bg-muted/50">
              <h3 className="font-semibold text-lg">Neue Lieferantenbestellung</h3>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Lieferant auswählen</label>
                <select 
                  value={newPoSupplier} 
                  onChange={e => setNewPoSupplier(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="" disabled>-- Bitte wählen --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Artikel</h4>
                  <button 
                    onClick={() => setNewPoItems([...newPoItems, {partId: parts[0]?.id || "", quantity: 1, cost: ""}])}
                    className="text-sm text-yellow-600 font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Zeile hinzufügen
                  </button>
                </div>

                {newPoItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-start">
                    <select 
                      value={item.partId}
                      onChange={e => {
                        const newItems = [...newPoItems];
                        newItems[idx].partId = e.target.value;
                        setNewPoItems(newItems);
                      }}
                      className="flex-1 p-2 border rounded-md text-sm bg-background"
                    >
                      {parts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.deviceModel ? `(${p.deviceModel})` : ""}
                        </option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      min="1" 
                      placeholder="Menge"
                      value={item.quantity}
                      onChange={e => {
                        const newItems = [...newPoItems];
                        newItems[idx].quantity = parseInt(e.target.value) || 1;
                        setNewPoItems(newItems);
                      }}
                      className="w-20 p-2 border rounded-md text-sm"
                    />
                    <button 
                      onClick={() => setNewPoItems(newPoItems.filter((_, i) => i !== idx))}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {newPoItems.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Noch keine Artikel hinzugefügt.</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2 bg-muted/20">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-muted">Abbrechen</button>
              <button 
                onClick={handleCreate}
                disabled={!newPoSupplier || newPoItems.length === 0}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-yellow-950 font-medium rounded-md"
              >
                Bestellung anlegen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
