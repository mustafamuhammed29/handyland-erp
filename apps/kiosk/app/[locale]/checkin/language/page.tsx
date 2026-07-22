"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "../../../../components/kiosk/WizardContext";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

// Premium Language Badges
const LangBadge = ({ text }: { text: string }) => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="24" fill="url(#grad)" />
    <text x="50" y="52" fill="white" fontSize="36" fontWeight="bold" fontFamily="system-ui, sans-serif" textAnchor="middle" dominantBaseline="middle">
      {text}
    </text>
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2A2A2A" />
        <stop offset="1" stopColor="#111111" />
      </linearGradient>
    </defs>
  </svg>
);

const languages = [
  { code: "de", name: "Deutsch", badge: <LangBadge text="DE" /> },
  { code: "en", name: "English", badge: <LangBadge text="EN" /> },
  { code: "ar", name: "العربية", badge: <LangBadge text="AR" /> },
  { code: "tr", name: "Türkçe", badge: <LangBadge text="TR" /> },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

export default function LanguageStep() {
  const t = useTranslations();
  const router = useRouter();
  const { setStepIndex, updateState } = useWizard();

  useEffect(() => {
    setStepIndex(0);
  }, [setStepIndex]);

  const selectLanguage = (code: string) => {
    updateState({ language: code });
    router.push(`/${code}/checkin/identify`);
  };

  return (
    <div className="flex flex-col items-center justify-between w-full min-h-[80vh]">
      
      {/* Header / Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full flex justify-center pt-8 z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Wrench className="w-6 h-6 text-[#0A0D14]" />
          </div>
          <span className="text-4xl font-display font-bold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Handyland
          </span>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl px-6 z-10 space-y-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-6xl font-display font-medium text-white drop-shadow-sm">{t("common.welcome", { fallback: "Willkommen" })}</h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light tracking-wide">{t("steps.language", { fallback: "Bitte wählen Sie Ihre Sprache" })}</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl"
        >
          {languages.map((lang) => (
            <motion.button
              key={lang.code}
              variants={itemVariants}
              whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(234, 179, 8, 0.15)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => selectLanguage(lang.code)}
              className="group relative flex items-center p-6 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 hover:border-yellow-500/50 transition-all duration-300 min-h-[120px] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/5 group-hover:to-transparent transition-all duration-500" />
              
              <div className="flex items-center gap-8 z-10 w-full pl-4">
                {lang.badge}
                <span className="text-3xl font-medium text-white tracking-wide">{lang.name}</span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="w-full flex justify-between items-center px-12 py-8 z-10 text-gray-500 text-sm font-medium"
      >
        <p>{t("common.footer", { year: new Date().getFullYear(), fallback: `© ${new Date().getFullYear()} HANDYLAND Reparaturzentrum` })}</p>
        <p>Kiosk v1.0.0</p>
      </motion.footer>

    </div>
  );
}
