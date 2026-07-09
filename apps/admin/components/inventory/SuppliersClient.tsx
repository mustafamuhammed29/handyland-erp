"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Building2, Phone, Mail, Globe, MapPin } from "lucide-react";
import { createSupplier, updateSupplier, deleteSuppliers } from "../../app/actions/suppliers";

type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  notes: string | null;
};

export function SuppliersClient({ initialSuppliers }: { initialSuppliers: Supplier[] }) {
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      website: formData.get("website") as string,
      address: formData.get("address") as string,
      notes: formData.get("notes") as string,
    };

    if (editingSupplier) {
      const res = await updateSupplier(editingSupplier.id, data);
      if (res.success && res.supplier) {
        setSuppliers(prev => prev.map(s => s.id === res.supplier.id ? res.supplier : s));
        setIsModalOpen(false);
      }
    } else {
      const res = await createSupplier(data);
      if (res.success && res.supplier) {
        setSuppliers([res.supplier, ...suppliers]);
        setIsModalOpen(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Möchten Sie diesen Lieferanten wirklich löschen?")) {
      const res = await deleteSuppliers([id]);
      if (res.success) {
        setSuppliers(prev => prev.filter(s => s.id !== id));
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Lieferant suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <button
          onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }}
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Neuer Lieferant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditingSupplier(supplier); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(supplier.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-yellow-100 text-yellow-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg">{supplier.name}</h3>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              {supplier.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {supplier.phone}
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {supplier.email}
                </div>
              )}
              {supplier.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> {supplier.website}
                </div>
              )}
              {supplier.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {supplier.address}
                </div>
              )}
              {supplier.notes && (
                <div className="mt-4 p-3 bg-muted rounded-lg text-xs italic">
                  {supplier.notes}
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredSuppliers.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border rounded-xl shadow-sm">
            Keine Lieferanten gefunden.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border overflow-hidden">
            <div className="p-4 border-b bg-muted/50">
              <h3 className="font-semibold text-lg">
                {editingSupplier ? "Lieferant bearbeiten" : "Neuer Lieferant"}
              </h3>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input name="name" defaultValue={editingSupplier?.name} required className="w-full p-2 border rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Telefon</label>
                  <input name="phone" defaultValue={editingSupplier?.phone || ""} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-Mail</label>
                  <input name="email" type="email" defaultValue={editingSupplier?.email || ""} className="w-full p-2 border rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Webseite</label>
                <input name="website" type="url" defaultValue={editingSupplier?.website || ""} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Adresse</label>
                <input name="address" defaultValue={editingSupplier?.address || ""} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notizen</label>
                <textarea name="notes" defaultValue={editingSupplier?.notes || ""} rows={3} className="w-full p-2 border rounded-md"></textarea>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-muted">Abbrechen</button>
                <button type="submit" className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-medium rounded-md">Speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
