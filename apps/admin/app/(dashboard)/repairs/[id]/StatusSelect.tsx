"use client";

import { useState } from "react";
import { RepairStatus } from "@repo/database";
import { updateRepairStatus } from "../../../actions/repair";

export default function StatusSelect({ repairId, currentStatus }: { repairId: string, currentStatus: RepairStatus }) {
  const [status, setStatus] = useState<RepairStatus>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as RepairStatus;
    setStatus(newStatus);
    setIsLoading(true);
    
    await updateRepairStatus(repairId, newStatus);
    
    setIsLoading(false);
  };

  const statuses: { value: RepairStatus; label: string }[] = [
    { value: "NEW", label: "Neu (Eingang)" },
    { value: "DIAGNOSING", label: "In Diagnose" },
    { value: "WAITING_FOR_PARTS", label: "Wartet auf Teile" },
    { value: "IN_REPAIR", label: "In Reparatur" },
    { value: "QUALITY_CHECK", label: "Qualitätskontrolle" },
    { value: "READY_FOR_PICKUP", label: "Abholbereit" },
    { value: "DELIVERED", label: "Abgeschlossen" },
    { value: "CANCELLED", label: "Storniert" },
  ];

  return (
    <div className="flex items-center gap-3">
      <select 
        aria-label="Reparaturstatus ändern"
        value={status} 
        onChange={handleStatusChange}
        disabled={isLoading}
        className="bg-card border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
      >
        {statuses.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      {isLoading && <span className="text-xs text-muted-foreground animate-pulse">Speichern...</span>}
    </div>
  );
}
