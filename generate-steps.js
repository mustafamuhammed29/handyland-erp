const fs = require('fs');
const path = require('path');

const steps = [
  { name: 'device', next: 'security', title: 'Geräteinformationen' },
  { name: 'security', next: 'problem', title: 'Sicherheit & Entsperrcode' },
  { name: 'problem', next: 'condition', title: 'Problembeschreibung' },
  { name: 'condition', next: 'accessories', title: 'Gerätezustand' },
  { name: 'accessories', next: 'history', title: 'Zubehör' },
  { name: 'history', next: 'signature', title: 'Reparaturhistorie' },
  { name: 'signature', next: 'confirmation', title: 'Unterschrift & AGB' },
  { name: 'confirmation', next: '', title: 'Bestätigung & Ticket' }
];

steps.forEach((step, idx) => {
  const dirPath = path.join('apps/kiosk/app/[locale]/checkin', step.name);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const content = `"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useKiosk } from "../../../../../components/kiosk/KioskProvider";
import { motion } from "framer-motion";

export default function ${step.name.charAt(0).toUpperCase() + step.name.slice(1)}Step() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { setStep } = useKiosk();

  useEffect(() => {
    setStep(${idx + 3});
  }, [setStep]);

  return (
    <div className="flex flex-col w-full max-w-2xl space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-display font-medium">${step.title}</h1>
        <p className="text-lg text-muted-foreground">
          Dieser Bereich befindet sich noch in der Entwicklung.
        </p>
      </div>

      <div className="flex justify-between items-center pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-4 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Zurück
        </button>
        ${step.next ? `
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(\`/\${locale}/checkin/${step.next}\`)}
          className="px-12 py-4 bg-foreground text-background rounded-full text-lg font-medium"
        >
          Weiter
        </motion.button>
        ` : `
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(\`/\${locale}/checkin/language\`)}
          className="px-12 py-4 bg-accent text-accent-foreground rounded-full text-lg font-medium"
        >
          Abschließen
        </motion.button>
        `}
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
});
