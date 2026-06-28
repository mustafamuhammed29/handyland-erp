"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { MoreHorizontal, Printer, Eye, Settings2, Trash2 } from "lucide-react";
import { deleteRepair } from "../../app/actions/repair";
import { useRouter } from "next/navigation";

export function RepairActionsDropdown({ repairId }: { repairId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm("Sind Sie sicher, dass Sie diese Reparatur endgültig löschen möchten?")) {
      startTransition(async () => {
        const res = await deleteRepair(repairId);
        if (res.success) {
          setIsOpen(false);
          router.refresh();
        } else {
          alert("Fehler beim Löschen: " + res.error);
        }
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Weitere Aktionen"
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors focus:outline-none"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-card border shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
          <div className="py-1">
            <Link
              href={`/repairs/${repairId}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Eye className="w-4 h-4 text-muted-foreground" />
              Details ansehen
            </Link>
            <Link
              href={`/repairs/${repairId}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              Status ändern
            </Link>
            <div className="h-px bg-border my-1" />
            <Link
              href={`/print/${repairId}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Printer className="w-4 h-4 text-muted-foreground" />
              Bon drucken
            </Link>
            <div className="h-px bg-border my-1" />
            <button
              disabled={isPending}
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4" />
              {isPending ? "Wird gelöscht..." : "Löschen"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
