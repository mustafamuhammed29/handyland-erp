"use client";

import React from "react";
import { motion } from "framer-motion";
import { useWizard } from "./WizardContext";

export function StepProgress() {
  const { currentStep, steps } = useWizard();
  
  if (currentStep === 0 || currentStep === steps.length - 1) {
    return null; // Don't show progress on language/identify (0) and confirmation (last)
  }

  const progress = (currentStep / (steps.length - 2)) * 100;
  const currentStepData = steps[currentStep];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Thin progress bar */}
      <div className="h-1 w-full bg-white/5">
        <motion.div 
          className="h-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      {/* Step info bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-2.5 py-1 rounded-full">
            Schritt {currentStep} von {steps.length - 2}
          </span>
          <span className="text-sm font-medium text-white/80">{currentStepData?.title || ""}</span>
        </div>
        <span className="text-xs text-white/40 hidden sm:block">HANDYLAND Kiosk</span>
      </div>
    </header>
  );
}
