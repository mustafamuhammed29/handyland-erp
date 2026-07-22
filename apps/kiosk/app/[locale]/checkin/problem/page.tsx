"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../../../../components/kiosk/WizardContext";
import { useTranslations } from "next-intl";
import { StepTransition, fieldVariants } from "../../../../components/kiosk/StepTransition";
import { 
  ArrowRight, ArrowLeft, 
  Smartphone, Battery, PlugZap, Volume2, 
  Ear, Mic, Camera, Droplet, 
  LayoutTemplate, Code, Unlock, DatabaseBackup, 
  HelpCircle
} from "lucide-react";

const PROBLEM_OPTIONS = [
  { id: "DISPLAY", translationKey: "tagDISPLAY", icon: Smartphone },
  { id: "BATTERY", translationKey: "tagBATTERY", icon: Battery },
  { id: "CHARGING_PORT", translationKey: "tagCHARGING_PORT", icon: PlugZap },
  { id: "SPEAKER", translationKey: "tagSPEAKER", icon: Volume2 },
  { id: "EARPIECE", translationKey: "tagEARPIECE", icon: Ear },
  { id: "MICROPHONE", translationKey: "tagMICROPHONE", icon: Mic },
  { id: "CAMERA", translationKey: "tagCAMERA", icon: Camera },
  { id: "WATER_DAMAGE", translationKey: "tagWATER_DAMAGE", icon: Droplet },
  { id: "BACK_COVER", translationKey: "tagBACK_COVER", icon: LayoutTemplate },
  { id: "SOFTWARE", translationKey: "tagSOFTWARE", icon: Code },
  { id: "UNLOCKING", translationKey: "tagUNLOCKING", icon: Unlock },
  { id: "DATA_RECOVERY", translationKey: "tagDATA_RECOVERY", icon: DatabaseBackup },
  { id: "OTHER", translationKey: "tagOTHER", icon: HelpCircle },
];

export default function ProblemStep() {
  const t = useTranslations();
  const { state, updateState, nextStep, prevStep } = useWizard();
  const [selectedProblems, setSelectedProblems] = useState<string[]>(state.problems || []);

  const toggleProblem = (id: string) => {
    setSelectedProblems(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const handleContinue = () => {
    updateState({ problems: selectedProblems });
    nextStep();
  };

  return (
    <StepTransition stepIndex={4}>
      <motion.div variants={fieldVariants} className="space-y-4 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-white">
          {t("problem.title")}
        </h1>
        <p className="text-lg text-white/60">
          {t("problem.subtitle")}
        </p>
      </motion.div>

      <div className="w-full max-w-3xl mx-auto space-y-8">
        <motion.div variants={fieldVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {PROBLEM_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedProblems.includes(option.id);
            
            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleProblem(option.id)}
                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                  isSelected 
                    ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)] shadow-[0_0_15px_rgba(245,197,24,0.15)]" 
                    : "bg-[var(--color-surface)] border-white/10 text-white/70 hover:border-white/30 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-10 h-10 mb-4 ${isSelected ? "text-[var(--color-primary)]" : "text-white/50"}`} strokeWidth={1.5} />
                <span className="text-sm font-medium text-center leading-tight">
                  {t(`problem.${option.translationKey}` as any)}
                </span>
                {isSelected && (
                  <div className="absolute top-3 right-3 w-3 h-3 bg-[var(--color-primary)] rounded-full shadow-[0_0_8px_var(--color-primary)]" />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div variants={fieldVariants} className="pt-8 flex gap-4 max-w-md mx-auto">
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
            disabled={selectedProblems.length === 0}
            className="w-2/3 bg-[var(--color-primary)] text-black font-medium text-lg py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,197,24,0.3)]"
          >
            {t("common.next")}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </motion.button>
        </motion.div>
      </div>
    </StepTransition>
  );
}
