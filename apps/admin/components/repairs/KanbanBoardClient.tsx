"use client";

import { useState } from "react";
import Link from "next/link";
import { updateRepairStatus, assignTechnician } from "../../app/actions/workflow";
import { RepairStatus } from "@repo/database";
import { Calendar, User, Eye, Wrench } from "lucide-react";

type KanbanProps = {
  initialRepairs: any[];
  technicians: any[];
  currentUser: { id: string; role: string };
};

const COLUMNS = [
  { id: "NEW", title: "Neu" },
  { id: "DIAGNOSING", title: "Diagnose" },
  { id: "WAITING_FOR_PARTS", title: "Wartet auf Teile" },
  { id: "IN_REPAIR", title: "In Reparatur" },
  { id: "QUALITY_CHECK", title: "Qualitätskontrolle" },
  { id: "READY_FOR_PICKUP", title: "Abholbereit" },
];

export function KanbanBoardClient({ initialRepairs, technicians, currentUser }: KanbanProps) {
  const [repairs, setRepairs] = useState(initialRepairs);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDragStart = (e: React.DragEvent, repairId: string) => {
    setDraggedId(repairId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    if (!draggedId || isUpdating) return;

    const repairToMove = repairs.find(r => r.id === draggedId);
    if (!repairToMove || repairToMove.status === statusId) return;

    // Optimistic UI Update
    const previousRepairs = [...repairs];
    setRepairs(repairs.map(r => r.id === draggedId ? { ...r, status: statusId } : r));
    
    setIsUpdating(true);
    const res = await updateRepairStatus(draggedId, statusId as RepairStatus);
    
    if (!res.success) {
      alert("Fehler beim Verschieben: " + res.error);
      setRepairs(previousRepairs); // Revert
    }
    
    setDraggedId(null);
    setIsUpdating(false);
  };

  const handleAssign = async (repairId: string, techId: string) => {
    setIsUpdating(true);
    // Optimistic Update
    const previousRepairs = [...repairs];
    setRepairs(repairs.map(r => r.id === repairId ? { ...r, assignedToId: techId === "UNASSIGNED" ? null : techId } : r));

    const res = await assignTechnician(repairId, techId === "UNASSIGNED" ? null : techId);
    if (!res.success) {
      alert(res.error);
      setRepairs(previousRepairs);
    }
    setIsUpdating(false);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-8 hide-scrollbar h-[calc(100vh-200px)] items-start">
      {COLUMNS.map(col => (
        <div 
          key={col.id} 
          className="flex-shrink-0 w-80 bg-muted/30 border rounded-xl flex flex-col max-h-full overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          <div className="p-3 border-b bg-muted/50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-foreground">{col.title}</h3>
            <span className="text-xs font-semibold bg-background border px-2 py-0.5 rounded-full text-muted-foreground">
              {repairs.filter(r => r.status === col.id).length}
            </span>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            {repairs.filter(r => r.status === col.id).map(repair => (
              <div 
                key={repair.id}
                draggable
                onDragStart={(e) => handleDragStart(e, repair.id)}
                className={`bg-card border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-accent/50 transition-colors ${draggedId === repair.id ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/repairs/${repair.id}`} className="font-mono font-bold text-sm hover:text-accent flex items-center gap-1.5">
                    {repair.ticketNumber}
                  </Link>
                  <Link href={`/repairs/${repair.id}`} className="text-muted-foreground hover:text-foreground">
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>

                <div className="text-xs font-medium text-foreground mb-2 line-clamp-1">
                  {repair.device?.manufacturer} {repair.device?.model}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {repair.issues.map((i: any) => (
                    <span key={i.id} className="text-[9px] uppercase font-bold tracking-wider bg-red-500/10 text-red-500 px-1 rounded">
                      {i.issueType}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t pt-2 mt-2">
                  <div className="flex items-center text-xs text-muted-foreground" title="Kunde">
                    <User className="w-3.5 h-3.5 mr-1" /> 
                    <span className="truncate max-w-[80px]">{repair.customer?.firstName} {repair.customer?.lastName}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                    <select 
                      disabled={isUpdating || (currentUser.role === "RECEPTIONIST")}
                      value={repair.assignedToId || "UNASSIGNED"}
                      onChange={e => handleAssign(repair.id, e.target.value)}
                      className="text-[10px] bg-transparent font-medium border border-transparent hover:border-border rounded px-1 py-0.5 max-w-[80px] cursor-pointer outline-none focus:ring-0"
                    >
                      <option value="UNASSIGNED">Zuweisen...</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
