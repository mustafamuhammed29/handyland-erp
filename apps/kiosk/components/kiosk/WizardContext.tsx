"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useTranslations, useLocale } from "next-intl";

export type WizardStep = {
  id: string;
  title: string;
  path: string;
};

export type WizardState = {
  language: string;
  customer: {
    phone: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  device: {
    brand: string;
    model: string;
    imei: string;
  };
  security: {
    devicePassword?: string;
    simPin?: string;
    pattern?: number[];
  };
  problems: string[];
  condition: {
    damages: string[];
  };
  accessories: {
    simCard: boolean;
    case: boolean;
  };
  history: {
    previousRepairs: boolean;
  };
  signature: string;
};

type WizardContextType = {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  currentStep: number;
  steps: WizardStep[];
  nextStep: () => void;
  prevStep: () => void;
  setStepIndex: (index: number) => void;
  resetState: () => void;
};

const initialState: WizardState = {
  language: "",
  customer: { phone: "", firstName: "", lastName: "", email: "" },
  device: { brand: "", model: "", imei: "" },
  security: { devicePassword: "", simPin: "", pattern: [] },
  problems: [],
  condition: { damages: [] },
  accessories: { simCard: false, case: false },
  history: { previousRepairs: false },
  signature: "",
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const t = useTranslations('steps');
  const locale = useLocale();

  const WIZARD_STEPS: WizardStep[] = [
    { id: "identify", title: t("identify"), path: `/${locale}/checkin/identify` },
    { id: "personal", title: t("personal"), path: `/${locale}/checkin/personal` },
    { id: "device", title: t("device"), path: `/${locale}/checkin/device` },
    { id: "security", title: t("security"), path: `/${locale}/checkin/security` },
    { id: "problem", title: t("problem"), path: `/${locale}/checkin/problem` },
    { id: "condition", title: t("condition"), path: `/${locale}/checkin/condition` },
    { id: "accessories", title: t("accessories"), path: `/${locale}/checkin/accessories` },
    { id: "history", title: t("history"), path: `/${locale}/checkin/history` },
    { id: "signature", title: t("signature"), path: `/${locale}/checkin/signature` },
    { id: "confirmation", title: t("confirmation"), path: `/${locale}/checkin/confirmation` }
  ];

  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      router.push(WIZARD_STEPS[nextIdx]!.path);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      router.push(WIZARD_STEPS[prevIdx]!.path);
    }
  };

  const setStepIndex = (index: number) => {
    setCurrentStep(index);
  };
  
  const resetState = () => {
    setState(initialState);
    setCurrentStep(0);
    router.push(WIZARD_STEPS[0]!.path);
  };

  return (
    <WizardContext.Provider
      value={{ 
        state, 
        updateState, 
        currentStep, 
        steps: WIZARD_STEPS, 
        nextStep, 
        prevStep, 
        setStepIndex, 
        resetState 
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
