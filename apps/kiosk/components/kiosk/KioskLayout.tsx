"use client";

import React from "react";
import { StepProgress } from "./StepProgress";

export function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen bg-[var(--color-bg)] text-white overflow-hidden selection:bg-[var(--color-primary)]/30">
      
      {/* Animated Subtle Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-primary)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[var(--color-primary)]/10 rounded-full blur-[150px]" />
      </div>

      <StepProgress />

      {/* Main Content Area */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 w-full max-w-5xl mx-auto z-10 pt-24">
        {children}
      </main>
    </div>
  );
}
