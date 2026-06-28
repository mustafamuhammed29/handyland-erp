"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useWizard } from "../../../../components/kiosk/WizardContext";
import { StepTransition } from "../../../../components/kiosk/StepTransition";
import { Loader2, UserCheck, ArrowRight, ShieldCheck, ChevronDown } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+43", label: "🇦🇹 +43" },
  { code: "+41", label: "🇨🇭 +41" },
  { code: "+31", label: "🇳🇱 +31" },
  { code: "+32", label: "🇧🇪 +32" },
  { code: "+33", label: "🇫🇷 +33" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+39", label: "🇮🇹 +39" },
  { code: "+34", label: "🇪🇸 +34" },
  { code: "+90", label: "🇹🇷 +90" },
  { code: "+48", label: "🇵🇱 +48" },
];

export default function IdentifyStep() {
  const { state, updateState, nextStep } = useWizard();
  const [countryCode, setCountryCode] = useState(() => {
    if (state.customer.phone) {
      const match = COUNTRY_CODES.find(c => state.customer.phone!.startsWith(c.code));
      return match ? match.code : "+49";
    }
    return "+49";
  });
  
  const [phone, setPhone] = useState(() => {
    if (state.customer.phone) {
      const match = COUNTRY_CODES.find(c => state.customer.phone!.startsWith(c.code));
      if (match) return state.customer.phone!.slice(match.code.length);
      if (state.customer.phone.startsWith("0")) return state.customer.phone.slice(1);
      return state.customer.phone;
    }
    return "";
  });

  const [isSearching, setIsSearching] = useState(false);
  const [customerFound, setCustomerFound] = useState<any>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [error, setError] = useState("");

  // Debounce phone number search
  useEffect(() => {
    if (phone.length < 6) {
      setCustomerFound(null);
      setSearchAttempted(false);
      return;
    }

    const timer = setTimeout(() => {
      searchCustomer(`${countryCode}${phone}`);
    }, 400);

    return () => clearTimeout(timer);
  }, [phone, countryCode]);

  const searchCustomer = async (phoneNumber: string) => {
    setIsSearching(true);
    setSearchAttempted(true);
    setError("");

    try {
      const res = await fetch(`/api/kiosk/identify?phone=${encodeURIComponent(phoneNumber)}`);
      const data = await res.json();

      if (data.found && data.customer) {
        setCustomerFound(data.customer);
        updateState({
          customer: {
            ...state.customer,
            phone: phoneNumber,
            firstName: data.customer.firstName,
            lastName: data.customer.lastName,
            email: data.customer.email || "",
          }
        });
      } else {
        setCustomerFound(null);
        updateState({
          customer: {
            ...state.customer,
            phone: phoneNumber,
          }
        });
      }
    } catch (err) {
      console.error(err);
      setError("Fehler bei der Kundensuche.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleContinue = () => {
    if (phone.length < 6) {
      setError("Bitte geben Sie eine gültige Telefonnummer ein.");
      return;
    }
    updateState({
      customer: {
        ...state.customer,
        phone: `${countryCode}${phone}`,
      }
    });
    nextStep();
  };

  return (
    <StepTransition stepIndex={0}>
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-white">
          Willkommen bei <span className="text-[var(--color-primary)]">HANDYLAND</span>
        </h1>
        <p className="text-lg text-white/60">
          Bitte geben Sie Ihre Telefonnummer ein, um zu beginnen.
        </p>
      </div>

      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Dummy hidden input to prevent browser autofill */}
        <input type="text" className="hidden" aria-hidden="true" tabIndex={-1} autoComplete="off" />

        <div className="relative flex flex-col sm:flex-row items-center gap-3">
          {/* Country Code Selector */}
          <div className="relative shrink-0 w-full sm:w-auto">
            <select
              aria-label="Ländervorwahl"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="appearance-none w-full bg-[var(--color-surface)] border border-white/10 rounded-2xl pl-4 pr-10 py-5 text-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all shadow-lg cursor-pointer"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code} className="bg-[#1a1a1a] text-white">
                  {c.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>

          {/* Phone Input */}
          <div className="relative flex-1 w-full">
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPhone(val.startsWith("0") ? val.slice(1) : val);
                setError("");
              }}
              placeholder="176 1234567"
              className="w-full bg-[var(--color-surface)] border border-white/10 rounded-2xl px-6 py-5 text-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-lg"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              name="customer_phone_no_autofill"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              {isSearching && <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[var(--color-error)] text-center text-sm"
            >
              {error}
            </motion.p>
          )}

          {searchAttempted && !isSearching && customerFound && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--color-surface)] border border-[var(--color-primary)]/30 rounded-2xl p-6 text-center space-y-3 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />
              <div className="mx-auto w-12 h-12 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center mb-2">
                <UserCheck className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-medium text-white">
                Willkommen zurück, {customerFound.firstName}! 👋
              </h3>
              <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                <span>Loyalty: {customerFound.loyaltyTier}</span>
                <span className="w-1 h-1 rounded-full bg-white/20 mx-1" />
                <span>{customerFound.totalRepairs} Reparaturen</span>
              </div>
            </motion.div>
          )}

          {searchAttempted && !isSearching && !customerFound && phone.length >= 8 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="text-center text-white/60 py-4"
            >
              Neuer Kunde. Wir werden Ihre Daten im nächsten Schritt aufnehmen.
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            disabled={isSearching || phone.length < 8}
            className="w-full bg-[var(--color-primary)] text-black font-medium text-lg py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,197,24,0.3)]"
          >
            Weiter
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </StepTransition>
  );
}
