"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../../../../components/kiosk/WizardContext";
import { StepTransition, fieldVariants } from "../../../../components/kiosk/StepTransition";
import { ArrowRight, ArrowLeft, History } from "lucide-react";

export default function HistoryStep() {
  const { state, updateState, nextStep, prevStep } = useWizard();
  const [previousRepairs, setPreviousRepairs] = useState<boolean | null>(state.history?.previousRepairs ?? null);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (previousRepairs === null) {
      setError("Bitte beantworten Sie die Frage.");
      return;
    }
    
    updateState({ 
      history: { 
        previousRepairs: previousRepairs 
      } 
    });
    nextStep();
  };

  return (
    <StepTransition stepIndex={7}>
      <motion.div variants={fieldVariants} className="space-y-4 text-center mb-8">
        <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <History className="w-8 h-8 text-[var(--color-primary)]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-medium text-white">
          Reparaturhistorie
        </h1>
        <p className="text-lg text-white/60">
          Wurde das Gerät in der Vergangenheit bereits repariert?
        </p>
      </motion.div>

      <div className="w-full max-w-md mx-auto space-y-8">
        <motion.div variants={fieldVariants} className="grid grid-cols-2 gap-4">
          <button
            onClick={() => { setPreviousRepairs(true); setError(""); }}
            className={`py-6 rounded-2xl border transition-all text-xl font-medium ${
              previousRepairs === true 
                ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)] shadow-[0_0_15px_rgba(245,197,24,0.3)]" 
                : "bg-[var(--color-surface)] border-white/10 text-white/70 hover:bg-white/5"
            }`}
          >
            Ja
          </button>
          <button
            onClick={() => { setPreviousRepairs(false); setError(""); }}
            className={`py-6 rounded-2xl border transition-all text-xl font-medium ${
              previousRepairs === false 
                ? "bg-white/20 text-white border-white/40" 
                : "bg-[var(--color-surface)] border-white/10 text-white/70 hover:bg-white/5"
            }`}
          >
            Nein
          </button>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[var(--color-error)] text-center text-sm"
          >
            {error}
          </motion.p>
        )}

        <motion.div variants={fieldVariants} className="pt-8 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={prevStep}
            className="w-1/3 bg-[var(--color-surface-2)] text-white font-medium text-lg py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="w-2/3 bg-[var(--color-primary)] text-black font-medium text-lg py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[var(--color-primary-hover)] transition-colors shadow-[0_0_20px_rgba(245,197,24,0.3)]"
          >
            Weiter
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </StepTransition>
  );
}
