"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../../../../components/kiosk/WizardContext";
import { StepTransition, fieldVariants } from "../../../../components/kiosk/StepTransition";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function DeviceStep() {
  const { state, updateState, nextStep, prevStep } = useWizard();
  const [brand, setBrand] = useState(state.device.brand || "");
  const [model, setModel] = useState(state.device.model || "");
  const [imei, setImei] = useState(state.device.imei || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleContinue = () => {
    const newErrors: { [key: string]: string } = {};
    if (!brand.trim()) newErrors.brand = "Hersteller ist erforderlich";
    if (!model.trim()) newErrors.model = "Modell ist erforderlich";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateState({
      device: {
        brand: brand.trim(),
        model: model.trim(),
        imei: imei.trim(),
      }
    });
    nextStep();
  };

  return (
    <StepTransition stepIndex={2}>
      <motion.div variants={fieldVariants} className="space-y-4 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-white">
          Ihre Gerätedaten
        </h1>
        <p className="text-lg text-white/60">
          Um welches Gerät handelt es sich?
        </p>
      </motion.div>

      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Dummy hidden input to prevent browser autofill */}
        <input type="text" className="hidden" aria-hidden="true" tabIndex={-1} autoComplete="off" />
        
        <motion.div variants={fieldVariants} className="space-y-2">
          <label className="text-sm font-medium text-white/80 ml-2">Hersteller *</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              if (errors.brand) setErrors({ ...errors, brand: "" });
            }}
            placeholder="z.B. Apple, Samsung"
            className={`w-full bg-[var(--color-surface)] border ${errors.brand ? 'border-[var(--color-error)]' : 'border-white/10'} rounded-2xl px-6 py-4 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="device_brand_no_autofill"
          />
          {errors.brand && <p className="text-[var(--color-error)] text-sm ml-2">{errors.brand}</p>}
        </motion.div>

        <motion.div variants={fieldVariants} className="space-y-2">
          <label className="text-sm font-medium text-white/80 ml-2">Modell *</label>
          <input
            type="text"
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              if (errors.model) setErrors({ ...errors, model: "" });
            }}
            placeholder="z.B. iPhone 13 Pro"
            className={`w-full bg-[var(--color-surface)] border ${errors.model ? 'border-[var(--color-error)]' : 'border-white/10'} rounded-2xl px-6 py-4 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="device_model_no_autofill"
          />
          {errors.model && <p className="text-[var(--color-error)] text-sm ml-2">{errors.model}</p>}
        </motion.div>

        <motion.div variants={fieldVariants} className="space-y-2">
          <label className="text-sm font-medium text-white/80 ml-2">IMEI / Seriennummer (Optional)</label>
          <input
            type="text"
            value={imei}
            onChange={(e) => setImei(e.target.value)}
            placeholder="IMEI Nummer eingeben"
            className="w-full bg-[var(--color-surface)] border border-white/10 rounded-2xl px-6 py-4 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="device_imei_no_autofill"
          />
          <p className="text-xs text-white/40 ml-2 mt-1">Tipp: Sie finden die IMEI meist unter Einstellungen {'>'} Allgemein {'>'} Info</p>
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
