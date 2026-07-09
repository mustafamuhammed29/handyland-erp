"use client";

import { useState, useEffect } from "react";
import { Calendar, TrendingUp, Users, Wrench, ChevronDown, DollarSign } from "lucide-react";
import { getAnalyticsData } from "../../app/actions/analytics";

type DateRange = "today" | "7days" | "30days" | "thisMonth" | "custom";

export function AnalyticsClient() {
  const [range, setRange] = useState<DateRange>("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    let start = new Date();
    let end = new Date();

    if (range === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (range === "7days") {
      start.setDate(start.getDate() - 7);
    } else if (range === "30days") {
      start.setDate(start.getDate() - 30);
    } else if (range === "thisMonth") {
      start = new Date(start.getFullYear(), start.getMonth(), 1);
    } else if (range === "custom") {
      if (customStart) start = new Date(customStart);
      if (customEnd) end = new Date(customEnd);
    }

    const startStr = start.toISOString();
    const endStr = end.toISOString();

    const res = await getAnalyticsData(startStr, endStr);
    if (res.success) {
      setData(res.data);
    } else {
      console.error(res.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (range !== "custom" || (customStart && customEnd)) {
      fetchStats();
    }
  }, [range, customStart, customEnd]);

  if (isLoading && !data) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Lade Statistiken...</div>;
  }

  const { summary, chartData, topIssues, technicianStats } = data || {};
  const maxVolume = chartData?.length ? Math.max(...chartData.map((d: any) => d.volume)) : 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 bg-muted p-1 rounded-lg w-full sm:w-auto overflow-x-auto hide-scrollbar">
          {[
            { id: "today", label: "Heute" },
            { id: "7days", label: "Letzte 7 Tage" },
            { id: "30days", label: "Letzte 30 Tage" },
            { id: "thisMonth", label: "Dieser Monat" },
            { id: "custom", label: "Benutzerdefiniert" },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setRange(r.id as any)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${range === r.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {range === "custom" && (
          <div className="flex items-center gap-2 text-sm w-full sm:w-auto">
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="border rounded-md px-3 py-1.5 bg-background" />
            <span>bis</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="border rounded-md px-3 py-1.5 bg-background" />
          </div>
        )}
      </div>

      {isLoading && <div className="text-xs text-accent text-center">Aktualisiere Daten...</div>}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-muted-foreground font-medium text-sm">Gesamtumsatz (Reparaturen)</p>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-display font-bold font-mono text-foreground">
            {summary?.totalRevenue.toFixed(2)} €
          </p>
        </div>
        
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-muted-foreground font-medium text-sm">Reparaturen (Eingegangen)</p>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Wrench className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">
            {summary?.totalRepairs}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Davon {summary?.completedRepairs} abgeschlossen</p>
        </div>

        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-muted-foreground font-medium text-sm">Wiederkehrende Kunden</p>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">
            {summary?.returningPercentage}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Haben mehr als 1 Reparatur</p>
        </div>

        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-muted-foreground font-medium text-sm">Ø Umsatz pro Reparatur</p>
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-display font-bold font-mono text-foreground">
            {summary?.completedRepairs > 0 ? (summary.totalRevenue / summary.completedRepairs).toFixed(2) : "0.00"} €
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (CSS based for safety) */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Reparatur-Trends (Volumen)</h2>
          {chartData?.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground italic">Keine Daten im Zeitraum</div>
          ) : (
            <div className="h-64 flex items-end gap-2">
              {chartData?.map((d: any, idx: number) => {
                const heightPct = maxVolume > 0 ? (d.volume / maxVolume) * 100 : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div 
                      className="w-full bg-accent/80 hover:bg-accent rounded-t-sm transition-all" 
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 pointer-events-none bg-black text-white text-xs rounded py-1 px-2 z-10 whitespace-nowrap transition-opacity">
                      {d.date}: {d.volume} Reparaturen
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex justify-between text-xs text-muted-foreground mt-2 border-t pt-2">
            <span>{chartData?.[0]?.date}</span>
            <span>{chartData?.[chartData.length - 1]?.date}</span>
          </div>
        </div>

        {/* Top Issues */}
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold mb-4">Häufigste Defekte</h2>
          <div className="flex-1 space-y-4">
            {topIssues?.length === 0 ? (
              <div className="text-sm text-muted-foreground italic">Keine Daten</div>
            ) : (
              topIssues?.slice(0, 6).map((issue: any, idx: number) => (
                <div key={issue.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-foreground">{issue.type}</span>
                    <span className="text-muted-foreground font-bold">{issue.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-destructive h-2 rounded-full" style={{ width: `${(issue.count / topIssues[0].count) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Technician Performance */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Mitarbeiter Performance (Abgeschlossen)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Techniker / Mitarbeiter</th>
                <th className="px-4 py-3 font-medium text-right">Abgeschlossene Reparaturen</th>
                <th className="px-4 py-3 font-medium text-right">Generierter Umsatz</th>
              </tr>
            </thead>
            <tbody>
              {technicianStats?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground italic">Keine abgeschlossenen Reparaturen zugewiesen.</td>
                </tr>
              ) : (
                technicianStats?.map((tech: any) => (
                  <tr key={tech.name} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{tech.name}</td>
                    <td className="px-4 py-3 text-right font-bold">{tech.completed}</td>
                    <td className="px-4 py-3 text-right font-mono">{tech.revenue.toFixed(2)} €</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
