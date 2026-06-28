"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../../../../components/kiosk/WizardContext";
import { StepTransition, fieldVariants } from "../../../../components/kiosk/StepTransition";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function PersonalStep() {
  const { state, updateState, nextStep, prevStep } = useWizard();
  const [firstName, setFirstName] = useState(state.customer.firstName || "");
  const [lastName, setLastName] = useState(state.customer.lastName || "");
  const [email, setEmail] = useState(state.customer.email || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleContinue = () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = "Vorname ist erforderlich";
    if (!lastName.trim()) newErrors.lastName = "Nachname ist erforderlich";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateState({
      customer: {
        ...state.customer,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      }
    });
    nextStep();
  };

  return (
    <StepTransition stepIndex={1}>
      <motion.div variants={fieldVariants} className="space-y-4 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-white">
          Persönliche Daten
        </h1>
        <p className="text-lg text-white/60">
          Wie dürfen wir Sie ansprechen?
        </p>
      </motion.div>

      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Dummy hidden input to prevent browser autofill */}
        <input type="text" className="hidden" aria-hidden="true" tabIndex={-1} autoComplete="off" />
        
        <motion.div variants={fieldVariants} className="space-y-2">
          <label className="text-sm font-medium text-white/80 ml-2">Vorname *</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (errors.firstName) setErrors({ ...errors, firstName: "" });
            }}
            placeholder="Max"
            className={`w-full bg-[var(--color-surface)] border ${errors.firstName ? 'border-[var(--color-error)]' : 'border-white/10'} rounded-2xl px-6 py-4 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="customer_first_name_no_autofill"
          />
          {errors.firstName && <p className="text-[var(--color-error)] text-sm ml-2">{errors.firstName}</p>}
        </motion.div>

        <motion.div variants={fieldVariants} className="space-y-2">
          <label className="text-sm font-medium text-white/80 ml-2">Nachname *</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (errors.lastName) setErrors({ ...errors, lastName: "" });
            }}
            placeholder="Mustermann"
            className={`w-full bg-[var(--color-surface)] border ${errors.lastName ? 'border-[var(--color-error)]' : 'border-white/10'} rounded-2xl px-6 py-4 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="customer_last_name_no_autofill"
          />
          {errors.lastName && <p className="text-[var(--color-error)] text-sm ml-2">{errors.lastName}</p>}
        </motion.div>

        <motion.div variants={fieldVariants} className="space-y-2">
          <label className="text-sm font-medium text-white/80 ml-2">E-Mail Adresse (Optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="max@beispiel.de"
            className="w-full bg-[var(--color-surface)] border border-white/10 rounded-2xl px-6 py-4 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="customer_email_no_autofill"
          />
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
