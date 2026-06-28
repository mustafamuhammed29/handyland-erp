"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../../../../components/kiosk/WizardContext";
import { StepTransition, fieldVariants } from "../../../../components/kiosk/StepTransition";
import { ArrowRight, ArrowLeft, Lock, Info } from "lucide-react";
import { PatternLock } from "../../../../components/kiosk/PatternLock";

export default function SecurityStep() {
  const { state, updateState, nextStep, prevStep } = useWizard();
  const [authType, setAuthType] = useState<"pin" | "pattern">(state.security.pattern && state.security.pattern.length > 0 ? "pattern" : "pin");
  const [devicePassword, setDevicePassword] = useState(state.security.devicePassword || "");
  const [pattern, setPattern] = useState<number[]>(state.security.pattern || []);
  const [simPin, setSimPin] = useState(state.security.simPin || "");

  const handleContinue = () => {
    updateState({
      security: {
        devicePassword: authType === "pin" ? devicePassword.trim() : "",
        pattern: authType === "pattern" ? pattern : [],
        simPin: simPin.trim(),
      }
    });
    nextStep();
  };

  return (
    <StepTransition stepIndex={3}>
      <motion.div variants={fieldVariants} className="space-y-4 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-white">
          Sicherheit & Entsperrung
        </h1>
        <p className="text-lg text-white/60">
          Wir benötigen Ihre Zugangsdaten für die Diagnose.
        </p>
      </motion.div>

      <motion.div variants={fieldVariants} className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-2xl p-4 flex gap-4 items-start w-full max-w-md mx-auto">
        <Info className="w-6 h-6 text-[var(--color-primary)] shrink-0 mt-0.5" />
        <p className="text-sm text-white/80">
          Ihre Daten werden sicher und verschlüsselt gespeichert und nur von unseren Technikern für die Reparatur verwendet.
        </p>
      </motion.div>

      <div className="w-full max-w-md mx-auto space-y-6 mt-6">
        {/* Dummy hidden input to prevent browser autofill */}
        <input type="text" className="hidden" aria-hidden="true" tabIndex={-1} autoComplete="off" />

        <motion.div variants={fieldVariants} className="flex bg-[var(--color-surface)] p-1 rounded-xl mb-6 border border-white/10">
          <button
            onClick={() => setAuthType("pin")}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${authType === "pin" ? "bg-white/10 text-white shadow" : "text-white/50 hover:text-white"}`}
          >
            Passwort / PIN
          </button>
          <button
            onClick={() => setAuthType("pattern")}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${authType === "pattern" ? "bg-white/10 text-white shadow" : "text-white/50 hover:text-white"}`}
          >
            Muster (Pattern)
          </button>
        </motion.div>

        {authType === "pin" ? (
          <motion.div variants={fieldVariants} className="space-y-2">
            <label htmlFor="devicePassword" className="text-sm font-medium text-white/80 ml-2">Gerätepasswort / PIN</label>
            <div className="relative">
              <input
                id="devicePassword"
                type="text"
                value={devicePassword}
                onChange={(e) => setDevicePassword(e.target.value)}
                placeholder="Entsperrcode für das Display"
                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                name="device_password_no_autofill"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            </div>
          </motion.div>
        ) : (
          <motion.div variants={fieldVariants} className="space-y-2 flex flex-col items-center">
            <label className="text-sm font-medium text-white/80 w-full ml-2">Entsperrmuster zeichnen</label>
            <PatternLock onComplete={(p) => setPattern(p)} />
          </motion.div>
        )}

        <motion.div variants={fieldVariants} className="space-y-2 pt-4">
          <label htmlFor="simPin" className="text-sm font-medium text-white/80 ml-2">SIM-PIN (Optional)</label>
          <div className="relative">
            <input
              id="simPin"
              type="text"
              value={simPin}
              onChange={(e) => setSimPin(e.target.value)}
              placeholder="PIN für die SIM-Karte"
              className="w-full bg-[var(--color-surface)] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              name="sim_pin_no_autofill"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          </div>
        </motion.div>

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
