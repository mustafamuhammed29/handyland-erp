"use client";

import React, { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useWizard } from "./WizardContext";

const stepVariants: Variants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { x: -60, opacity: 0, transition: { duration: 0.2 } }
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

export const fieldVariants: Variants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } }
};

export function StepTransition({ children, stepIndex }: { children: React.ReactNode, stepIndex: number }) {
  const { setStepIndex } = useWizard();
  
  useEffect(() => {
    setStepIndex(stepIndex);
  }, [stepIndex, setStepIndex]);

  return (
    <motion.div
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="w-full flex flex-col h-full items-center"
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl flex flex-col space-y-8"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
