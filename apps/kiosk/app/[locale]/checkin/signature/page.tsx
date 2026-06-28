"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../../../../components/kiosk/WizardContext";
import { StepTransition, fieldVariants } from "../../../../components/kiosk/StepTransition";
import { ArrowRight, ArrowLeft, Trash2, CheckCircle2 } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

export default function SignatureStep() {
  const { state, updateState, nextStep, prevStep } = useWizard();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setHasSignature(false);
    setError("");
  };

  const handleEnd = () => {
    if (sigCanvas.current?.isEmpty()) {
      setHasSignature(false);
    } else {
      setHasSignature(true);
      setError("");
    }
  };

  const handleContinue = () => {
    if (!hasSignature) {
      setError("Bitte unterschreiben Sie im markierten Feld.");
      return;
    }
    if (!termsAccepted) {
      setError("Bitte akzeptieren Sie die Reparaturbedingungen.");
      return;
    }
    
    const signatureDataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    
    updateState({ 
      signature: signatureDataUrl || ""
    });
    nextStep();
  };

  return (
    <StepTransition stepIndex={8}>
      <motion.div variants={fieldVariants} className="space-y-4 text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-white">
          Unterschrift & AGB
        </h1>
        <p className="text-lg text-white/60">
          Bitte bestätigen Sie die Reparatur mit Ihrer Unterschrift.
        </p>
      </motion.div>

      <div className="w-full max-w-2xl mx-auto space-y-8">
        
        <motion.div variants={fieldVariants} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white/80 ml-2">Ihre Unterschrift *</label>
            <button 
              onClick={clearSignature}
              className="text-sm text-white/50 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Unterschrift löschen
            </button>
          </div>
          
          <div 
            className={`w-full bg-[var(--color-surface)] border-2 rounded-2xl overflow-hidden transition-all duration-300 touch-none ${hasSignature ? 'border-[var(--color-primary)]' : 'border-white/10 hover:border-white/30'}`}
          >
            <SignatureCanvas 
              ref={sigCanvas}
              onEnd={handleEnd}
              penColor="#ffffff"
              canvasProps={{
                className: "w-full h-64 cursor-crosshair",
                style: { touchAction: 'none' }
              }}
              backgroundColor="transparent"
              clearOnResize={false}
            />
          </div>
        </motion.div>

        <motion.div variants={fieldVariants} className="bg-[var(--color-surface-2)] p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-start gap-4 cursor-pointer" onClick={() => { setTermsAccepted(!termsAccepted); setError(""); }}>
            <div className={`mt-1 shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${termsAccepted ? 'bg-[var(--color-primary)] text-black' : 'bg-white/10 border border-white/20'}`}>
              {termsAccepted && <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div className="space-y-1">
              <p className="text-base text-white/90 leading-tight">
                Ich akzeptiere die Allgemeinen Geschäftsbedingungen und die Datenschutzerklärung.
              </p>
              <p className="text-sm text-white/50">
                Ich stimme zu, dass meine Daten für die Zwecke der Reparaturabwicklung gespeichert und verarbeitet werden.
              </p>
            </div>
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

        <motion.div variants={fieldVariants} className="pt-4 flex gap-4">
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
