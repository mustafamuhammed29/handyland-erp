"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { MoreHorizontal, FileText, Trash2, Edit } from "lucide-react";
import { deleteCustomer } from "../../app/actions/customer";
import { useRouter } from "next/navigation";

export function CustomerActionsDropdown({ customerId }: { customerId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm("Sind Sie sicher, dass Sie diesen Kunden löschen möchten?")) {
      startTransition(async () => {
        const res = await deleteCustomer(customerId);
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
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label="Aktionen"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            <Link
              href={`/repairs?customerId=${customerId}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              Reparaturen ansehen
            </Link>
            <Link
              href={`/customers/${customerId}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Edit className="w-4 h-4 text-muted-foreground" />
              Bearbeiten
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
