"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../../../../components/kiosk/WizardContext";
import { useTranslations } from "next-intl";
import { StepTransition, fieldVariants } from "../../../../components/kiosk/StepTransition";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function DeviceStep() {
  const t = useTranslations();
  const { state, updateState, nextStep, prevStep } = useWizard();
  const [brand, setBrand] = useState(state.device.brand || "");
  const [model, setModel] = useState(state.device.model || "");
  const [imei, setImei] = useState(state.device.imei || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleContinue = () => {
    const newErrors: { [key: string]: string } = {};
    if (!brand.trim()) newErrors.brand = t("errors.general"); // Will use generic or specific if I added it
    if (!model.trim()) newErrors.model = t("device.modelErr");
    
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
          {t("device.title")}
        </h1>
        <p className="text-lg text-white/60">
          {t("device.subtitle")}
        </p>
      </motion.div>

      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Dummy hidden input to prevent browser autofill */}
        <input type="text" className="hidden" aria-hidden="true" tabIndex={-1} autoComplete="off" />
        
        <motion.div variants={fieldVariants} className="space-y-2">
          <label className="text-sm font-medium text-white/80 ms-2">{t("device.brand")}</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              if (errors.brand) setErrors({ ...errors, brand: "" });
            }}
            placeholder="Apple, Samsung..."
            className={`w-full bg-[var(--color-surface)] border ${errors.brand ? 'border-[var(--color-error)]' : 'border-white/10'} rounded-2xl px-6 py-4 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="device_brand_no_autofill"
          />
          {errors.brand && <p className="text-[var(--color-error)] text-sm ms-2">{errors.brand}</p>}
        </motion.div>

        <motion.div variants={fieldVariants} className="space-y-2">
          <label className="text-sm font-medium text-white/80 ms-2">{t("device.model")}</label>
          <input
            type="text"
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              if (errors.model) setErrors({ ...errors, model: "" });
            }}
            placeholder={t("device.modelPlaceholder")}
            className={`w-full bg-[var(--color-surface)] border ${errors.model ? 'border-[var(--color-error)]' : 'border-white/10'} rounded-2xl px-6 py-4 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="device_model_no_autofill"
          />
          {errors.model && <p className="text-[var(--color-error)] text-sm ms-2">{errors.model}</p>}
        </motion.div>

        <motion.div variants={fieldVariants} className="space-y-2">
          <label className="text-sm font-medium text-white/80 ms-2">{t("device.imei")}</label>
          <input
            type="text"
            value={imei}
            onChange={(e) => setImei(e.target.value)}
            placeholder={t("device.imeiPlaceholder")}
            dir="ltr"
            className="w-full bg-[var(--color-surface)] border border-white/10 rounded-2xl px-6 py-4 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all text-left ltr"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="device_imei_no_autofill"
          />
        </motion.div>

        <motion.div variants={fieldVariants} className="pt-8 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={prevStep}
            className="w-1/3 bg-[var(--color-surface-2)] text-white font-medium text-lg py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            {t("common.back")}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="w-2/3 bg-[var(--color-primary)] text-black font-medium text-lg py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[var(--color-primary-hover)] transition-colors shadow-[0_0_20px_rgba(245,197,24,0.3)]"
          >
            {t("common.next")}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </motion.button>
        </motion.div>
      </div>
    </StepTransition>
  );
}
