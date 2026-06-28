"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Wrench, User, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ repairs: any[], customers: any[] }>({ repairs: [], customers: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search-input")?.focus();
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        document.getElementById("global-search-input")?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ repairs: [], customers: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative" ref={wrapperRef}>
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        id="global-search-input"
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (query.length >= 2) setIsOpen(true);
        }}
        placeholder="Suche Reparaturen, Kunden... (Cmd+K)"
        className="h-10 w-64 md:w-80 rounded-xl border bg-card pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm"
        autoComplete="off"
      />
      {isSearching && (
        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
      )}
      {!isSearching && query && (
        <button aria-label="Suche leeren" onClick={() => { setQuery(""); setIsOpen(false); }} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      )}

      {isOpen && (query.trim().length >= 2) && (
        <div className="absolute top-12 left-0 w-full md:w-[400px] bg-card border rounded-xl shadow-xl overflow-hidden z-50 max-h-[70vh] flex flex-col">
          <div className="overflow-y-auto p-2">
            {!isSearching && results.repairs.length === 0 && results.customers.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Keine Ergebnisse gefunden für "{query}"
              </div>
            )}

            {results.customers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 py-2">
                  Kunden
                </h3>
                <div className="space-y-1">
                  {results.customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/customers/${c.id}`);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">
                          {c.firstName || c.lastName ? `${c.firstName} ${c.lastName}`.trim() : "Unbekannter Kunde"}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{c.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.repairs.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 py-2">
                  Reparaturen
                </h3>
                <div className="space-y-1">
                  {results.repairs.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/repairs/${r.id}`);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-bold font-mono text-primary truncate">{r.ticketNumber}</p>
                          <span className="text-[10px] px-1.5 py-0.5 border rounded-sm bg-background">
                            {r.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {r.device?.manufacturer} {r.device?.model}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
