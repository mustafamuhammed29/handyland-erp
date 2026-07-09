"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, Check } from "lucide-react";
import { processDirectSale } from "../../app/actions/inventory";

type Part = {
  id: string;
  name: string;
  category: string | null;
  sku: string | null;
  brand: string | null;
  deviceModel: string | null;
  quantity: number;
  price: string;
};

type CartItem = Part & { cartQuantity: number };

export function PosClient({ initialParts }: { initialParts: Part[] }) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const filteredParts = useMemo(() => {
    if (!search.trim()) return initialParts.slice(0, 10); // Show first 10 when empty
    const query = search.toLowerCase();
    return initialParts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query) ||
      p.deviceModel?.toLowerCase().includes(query)
    ).slice(0, 15);
  }, [search, initialParts]);

  const addToCart = (part: Part) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === part.id);
      if (existing) {
        if (existing.cartQuantity >= part.quantity) return prev; // Cannot add more than stock
        return prev.map(p => p.id === part.id ? { ...p, cartQuantity: p.cartQuantity + 1 } : p);
      }
      if (part.quantity <= 0) return prev; // Out of stock
      return [...prev, { ...part, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newQty = Math.max(0, Math.min(p.quantity, p.cartQuantity + delta));
      return { ...p, cartQuantity: newQty };
    }).filter(p => p.cartQuantity > 0));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.cartQuantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const items = cart.map(item => ({
        partId: item.id,
        quantity: item.cartQuantity,
        price: parseFloat(item.price)
      }));
      const res = await processDirectSale(items);
      if (res.success) {
        setSuccess(true);
        setCart([]);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Fehler beim Verkauf: " + res.error);
      }
    } catch (e) {
      alert("Ein Fehler ist aufgetreten.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Suchen nach Name, SKU, Kategorie oder Modell..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted border-transparent rounded-lg focus:bg-background focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredParts.map(part => {
            const outOfStock = part.quantity <= 0;
            return (
              <button
                key={part.id}
                onClick={() => addToCart(part)}
                disabled={outOfStock}
                className={`text-left p-4 rounded-xl border transition-all ${
                  outOfStock 
                    ? "opacity-50 bg-muted cursor-not-allowed" 
                    : "bg-card hover:border-yellow-400 hover:shadow-md active:scale-[0.98]"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-foreground line-clamp-1">{part.name}</div>
                  <div className="text-yellow-600 font-bold whitespace-nowrap">€{parseFloat(part.price).toFixed(2)}</div>
                </div>
                <div className="text-xs text-muted-foreground mb-3 flex gap-2">
                  <span>{part.category || 'Keine Kategorie'}</span>
                  <span>•</span>
                  <span>{part.sku || 'Keine SKU'}</span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    outOfStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}>
                    {part.quantity} auf Lager
                  </span>
                  {!outOfStock && (
                    <div className="h-8 w-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
          {filteredParts.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card border rounded-xl shadow-sm">
              Keine Artikel gefunden.
            </div>
          )}
        </div>
      </div>

      {/* Shopping Cart */}
      <div className="bg-card border rounded-xl shadow-sm flex flex-col h-[calc(100vh-10rem)] sticky top-6">
        <div className="p-4 border-b bg-muted/50 rounded-t-xl flex items-center gap-3">
          <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-lg">Warenkorb</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <p>Warenkorb ist leer</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col gap-3 p-3 bg-muted/30 border rounded-lg">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm pr-2">{item.name}</span>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 border rounded-md bg-background">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-muted rounded-l-md">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.cartQuantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-muted rounded-r-md">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-bold text-foreground">
                    €{(parseFloat(item.price) * item.cartQuantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-muted/50 rounded-b-xl space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium text-muted-foreground">Gesamt</span>
            <span className="font-bold text-2xl text-foreground">€{totalAmount.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full py-4 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl font-bold text-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : success ? (
              <>
                <Check className="w-6 h-6" /> Erfolgreich!
              </>
            ) : (
              "Zahlung abschließen"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
