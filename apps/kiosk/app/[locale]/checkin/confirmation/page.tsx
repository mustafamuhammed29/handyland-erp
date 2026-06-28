"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWizard } from "../../../../components/kiosk/WizardContext";
import { StepTransition, fieldVariants } from "../../../../components/kiosk/StepTransition";
import { CheckCircle2, Loader2, Home } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function ConfirmationStep() {
  const { state, resetState } = useWizard();
  const [status, setStatus] = useState<"submitting" | "success" | "error">("submitting");
  const [ticketNumber, setTicketNumber] = useState<string>("");
  const hasSubmitted = React.useRef(false);

  useEffect(() => {
    const submitData = async () => {
      try {
        const res = await fetch("/api/kiosk/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state),
        });

        if (!res.ok) throw new Error("Submission failed");

        const data = await res.json();
        setTicketNumber(data.ticketNumber);
        setStatus("success");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    // Ensure we only submit once
    if (status === "submitting" && state.signature && !hasSubmitted.current) {
      hasSubmitted.current = true;
      submitData();
    } else if (!state.signature && !hasSubmitted.current) {
      setStatus("error");
    }
  }, [state, status]);

  if (status === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Loader2 className="w-16 h-16 animate-spin text-[var(--color-primary)]" />
        <h2 className="text-2xl font-medium text-white">Daten werden sicher übertragen...</h2>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-[var(--color-error)]/20 rounded-full flex items-center justify-center">
          <span className="text-4xl">❌</span>
        </div>
        <h2 className="text-3xl font-medium text-white">Ein Fehler ist aufgetreten</h2>
        <p className="text-white/60">Bitte wenden Sie sich an einen Mitarbeiter an der Rezeption.</p>
        <button
          onClick={resetState}
          className="mt-8 px-8 py-4 bg-[var(--color-surface-2)] text-white rounded-2xl hover:bg-white/10 transition-colors"
        >
          Zurück zum Start
        </button>
      </div>
    );
  }

  return (
    <StepTransition stepIndex={9}>
      <motion.div variants={fieldVariants} className="flex flex-col items-center justify-center text-center space-y-8 max-w-lg mx-auto py-12">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="w-24 h-24 bg-[var(--color-success)]/20 rounded-full flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="w-14 h-14 text-[var(--color-success)]" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-medium text-white">
            Auftrag erfolgreich!
          </h1>
          <p className="text-xl text-white/70">
            Ihre Reparatur wurde aufgenommen.
          </p>
        </div>

        <motion.div 
          variants={fieldVariants}
          className="bg-[var(--color-surface)] border border-[var(--color-primary)]/30 rounded-3xl p-8 w-full relative overflow-hidden shadow-[0_0_30px_rgba(245,197,24,0.15)]"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent" />
          
          <p className="text-sm text-white/50 mb-2 uppercase tracking-widest font-medium">Ticket Nummer</p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl font-mono text-[var(--color-primary)] tracking-wider font-bold mb-8"
          >
            {ticketNumber}
          </motion.div>

          <div className="bg-white p-4 rounded-2xl inline-block mb-4 shadow-lg">
            <QRCodeSVG 
              value={`https://handyland.de/track/${ticketNumber}`} 
              size={180}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
          <p className="text-sm text-white/50 mt-2">QR Code scannen für Status-Updates</p>
        </motion.div>

        <motion.button
          variants={fieldVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={resetState}
          className="mt-8 bg-[var(--color-surface-2)] text-white font-medium text-lg py-4 px-8 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-colors border border-white/10"
        >
          <Home className="w-5 h-5" />
          Fertig & Zurück zum Start
        </motion.button>
      </motion.div>
    </StepTransition>
  );
}
