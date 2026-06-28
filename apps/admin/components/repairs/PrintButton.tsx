"use client";

import React, { useState } from "react";
import { Printer } from "lucide-react";
import { PrePrintModal } from "./PrePrintModal";

export function PrintButton({ repair }: { repair: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-black rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
      >
        <Printer className="h-4 w-4" /> Print / PDF generieren
      </button>
      
      {isOpen && (
        <PrePrintModal 
          repair={repair} 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
