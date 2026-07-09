import { AnalyticsClient } from "../../../components/analytics/AnalyticsClient";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Statistiken</h1>
          <p className="text-muted-foreground">Umsätze, Reparaturtrends und Mitarbeiter-Performance im Überblick.</p>
        </div>
      </div>

      <AnalyticsClient />
    </div>
  );
}
