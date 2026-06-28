"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../../../../components/kiosk/WizardContext";
import { StepTransition, fieldVariants } from "../../../../components/kiosk/StepTransition";
import { ArrowRight, ArrowLeft, Camera, CheckSquare, Square } from "lucide-react";

const CONDITION_OPTIONS = [
  { id: "SCREEN_SCRATCHES", label: "Kratzer auf dem Display" },
  { id: "CRACKED_SCREEN", label: "Displayglas gesprungen" },
  { id: "BACK_COVER_DAMAGED", label: "Rückseite beschädigt" },
  { id: "BENT_FRAME", label: "Gehäuse verbogen" },
  { id: "WATER_DAMAGE_VISIBLE", label: "Sichtbarer Wasserschaden" },
  { id: "BROKEN_CAMERA_GLASS", label: "Kameraglas gebrochen" },
  { id: "OTHER", label: "Sonstige Mängel" },
];

export default function ConditionStep() {
  const { state, updateState, nextStep, prevStep } = useWizard();
  const [damages, setDamages] = useState<string[]>(state.condition?.damages || []);
  const [photoAdded, setPhotoAdded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleDamage = (id: string) => {
    setDamages(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    updateState({ condition: { damages } });
    nextStep();
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoAdded(true);
      // Actual upload logic would go here
    }
  };

  return (
    <StepTransition stepIndex={5}>
      <motion.div variants={fieldVariants} className="space-y-4 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-white">
          Optische Mängel
        </h1>
        <p className="text-lg text-white/60">
          Hat das Gerät bereits sichtbare Schäden?
        </p>
      </motion.div>

      <div className="w-full max-w-md mx-auto space-y-8">
        <motion.div variants={fieldVariants} className="space-y-3">
          {CONDITION_OPTIONS.map((option) => {
            const isSelected = damages.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleDamage(option.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isSelected 
                    ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-white" 
                    : "bg-[var(--color-surface)] border-white/10 text-white/70 hover:bg-white/5"
                }`}
              >
                <span className="text-lg">{option.label}</span>
                {isSelected ? (
                  <CheckSquare className="w-6 h-6 text-[var(--color-primary)]" />
                ) : (
                  <Square className="w-6 h-6 text-white/30" />
                )}
              </button>
            );
          })}
        </motion.div>

        <motion.div variants={fieldVariants}>
          <input 
            type="file" 
            accept="image/*" 
            aria-label="Gerätefoto aufnehmen"
            className="hidden" 
            ref={fileInputRef}
            onChange={handlePhotoChange}
          />
          <button
            onClick={handlePhotoClick}
            className={`w-full py-5 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed transition-colors ${
              photoAdded 
                ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]" 
                : "border-white/20 bg-[var(--color-surface)] hover:bg-white/5 text-white/60"
            }`}
          >
            <Camera className={`w-8 h-8 ${photoAdded ? "text-[var(--color-success)]" : "text-white/40"}`} />
            <span className="font-medium">
              {photoAdded ? "Foto hinzugefügt (Erneut aufnehmen)" : "Foto vom Gerät machen (Optional)"}
            </span>
          </button>
        </motion.div>

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
