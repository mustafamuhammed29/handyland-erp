"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { addPartToRepair, removePartFromRepair, updateRepairPartQuantity } from "../../app/actions/repair";
import { useRouter } from "next/navigation";

type Part = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type RepairPart = {
  id: string;
  partId: string;
  quantity: number;
  price: number;
  part: { name: string; quantity: number };
};

export function RepairPartsEditor({ 
  repairId, 
  availableParts, 
  assignedParts 
}: { 
  repairId: string; 
  availableParts: Part[]; 
  assignedParts: RepairPart[]; 
}) {
  const router = useRouter();
  const [selectedPart, setSelectedPart] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!selectedPart || quantity < 1) return;
    setIsLoading(true);
    const res = await addPartToRepair(repairId, selectedPart, quantity);
    if (res.success) {
      setSelectedPart("");
      setQuantity(1);
      setIsAdding(false);
      router.refresh();
    } else {
      alert("Fehler: " + (res as any).error);
    }
    setIsLoading(false);
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Teil entfernen und zurück ins Lager buchen?")) return;
    setIsLoading(true);
    const res = await removePartFromRepair(id);
    if (res.success) {
      router.refresh();
    } else {
      alert("Fehler: " + (res as any).error);
    }
    setIsLoading(false);
  };

  const startEdit = (rp: RepairPart) => {
    setEditingId(rp.id);
    setEditQuantity(rp.quantity);
  };

  const saveEdit = async (id: string) => {
    setIsLoading(true);
    const res = await updateRepairPartQuantity(id, editQuantity);
    if (res.success) {
      setEditingId(null);
      router.refresh();
    } else {
      alert("Fehler: " + (res as any).error);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h2 className="text-lg font-medium flex items-center gap-2">
          Verbaute Ersatzteile
        </h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Hinzufügen
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-muted/30 p-3 rounded-lg border flex flex-col gap-3 mb-4">
          <select 
            value={selectedPart}
            onChange={(e) => setSelectedPart(e.target.value)}
            className="w-full p-2 text-sm border rounded bg-background"
          >
            <option value="">-- Ersatzteil wählen --</option>
            {availableParts.map(p => (
              <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                {p.name} (Lager: {p.quantity}) - {Number(p.price).toFixed(2)}€
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input 
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-20 p-2 text-sm border rounded"
              placeholder="Menge"
            />
            <button 
              onClick={handleAdd}
              disabled={isLoading || !selectedPart}
              className="px-3 text-sm bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-medium rounded transition-colors disabled:opacity-50 flex-1"
            >
              Hinzufügen
            </button>
            <button 
              onClick={() => setIsAdding(false)}
              className="px-3 text-sm border bg-background hover:bg-muted rounded"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {assignedParts.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Noch keine Teile zugewiesen.</p>
      ) : (
        <ul className="space-y-3">
          {assignedParts.map(rp => (
            <li key={rp.id} className="flex justify-between items-center p-3 border rounded-lg bg-background">
              <div>
                <p className="font-medium text-sm">{rp.part.name}</p>
                <p className="text-xs text-muted-foreground">{Number(rp.price).toFixed(2)}€ / Stk.</p>
              </div>
              
              <div className="flex items-center gap-3">
                {editingId === rp.id ? (
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min="1"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                      className="w-14 p-1 text-sm border rounded text-center"
                    />
                    <button onClick={() => saveEdit(rp.id)} disabled={isLoading} className="text-green-600 p-1 hover:bg-green-50 rounded">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500 p-1 hover:bg-gray-100 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm px-2 py-1 bg-muted rounded">x{rp.quantity}</span>
                    <button onClick={() => startEdit(rp)} className="text-muted-foreground hover:text-foreground p-1">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRemove(rp.id)} disabled={isLoading} className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
