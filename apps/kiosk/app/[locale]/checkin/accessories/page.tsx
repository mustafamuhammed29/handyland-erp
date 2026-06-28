"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../../../../components/kiosk/WizardContext";
import { StepTransition, fieldVariants } from "../../../../components/kiosk/StepTransition";
import { ArrowRight, ArrowLeft, CreditCard, Smartphone } from "lucide-react";

export default function AccessoriesStep() {
  const { state, updateState, nextStep, prevStep } = useWizard();
  const [hasSimCard, setHasSimCard] = useState<boolean | null>(state.accessories?.simCard ?? null);
  const [hasCase, setHasCase] = useState<boolean | null>(state.accessories?.case ?? null);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (hasSimCard === null || hasCase === null) {
      setError("Bitte beantworten Sie beide Fragen.");
      return;
    }
    
    updateState({ 
      accessories: { 
        simCard: hasSimCard,
        case: hasCase
      } 
    });
    nextStep();
  };

  return (
    <StepTransition stepIndex={6}>
      <motion.div variants={fieldVariants} className="space-y-4 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-white">
          Zubehör
        </h1>
        <p className="text-lg text-white/60">
          Was geben Sie zusammen mit dem Gerät ab?
        </p>
      </motion.div>

      <div className="w-full max-w-md mx-auto space-y-8">
        
        <motion.div variants={fieldVariants} className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white/70" />
            </div>
            <h3 className="text-xl font-medium text-white">SIM-Karte im Gerät?</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setHasSimCard(true); setError(""); }}
              className={`py-4 rounded-xl border transition-all text-lg font-medium ${
                hasSimCard === true 
                  ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)] shadow-[0_0_15px_rgba(245,197,24,0.3)]" 
                  : "bg-[var(--color-surface)] border-white/10 text-white/70 hover:bg-white/5"
              }`}
            >
              Ja
            </button>
            <button
              onClick={() => { setHasSimCard(false); setError(""); }}
              className={`py-4 rounded-xl border transition-all text-lg font-medium ${
                hasSimCard === false 
                  ? "bg-white/20 text-white border-white/40" 
                  : "bg-[var(--color-surface)] border-white/10 text-white/70 hover:bg-white/5"
              }`}
            >
              Nein
            </button>
          </div>
        </motion.div>

        <motion.div variants={fieldVariants} className="space-y-4 pt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white/70" />
            </div>
            <h3 className="text-xl font-medium text-white">Handyhülle abgeben?</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setHasCase(true); setError(""); }}
              className={`py-4 rounded-xl border transition-all text-lg font-medium ${
                hasCase === true 
                  ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)] shadow-[0_0_15px_rgba(245,197,24,0.3)]" 
                  : "bg-[var(--color-surface)] border-white/10 text-white/70 hover:bg-white/5"
              }`}
            >
              Ja
            </button>
            <button
              onClick={() => { setHasCase(false); setError(""); }}
              className={`py-4 rounded-xl border transition-all text-lg font-medium ${
                hasCase === false 
                  ? "bg-white/20 text-white border-white/40" 
                  : "bg-[var(--color-surface)] border-white/10 text-white/70 hover:bg-white/5"
              }`}
            >
              Nein
            </button>
          </div>
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
