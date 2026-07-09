"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { RepairOrderPDF } from "@repo/ui/pdf/RepairOrderPDF";
import { useEffect, useState } from "react";

export function PrintViewerClient({ 
  repairData,
  qrCodeUrl,
  decryptedPassword,
  decryptedPin,
  decryptedPattern
}: { 
  repairData: any;
  qrCodeUrl: string;
  decryptedPassword?: string | null;
  decryptedPin?: string | null;
  decryptedPattern?: string | null;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="p-10 text-center font-medium">Lade Druckansicht...</div>;

  return (
    <PDFViewer className="w-full h-full rounded-xl shadow-xl border-0">
      <RepairOrderPDF 
        repair={repairData} 
        qrCodeDataUrl={qrCodeUrl}
        decryptedPassword={decryptedPassword || undefined}
        decryptedPin={decryptedPin || undefined}
        decryptedPattern={decryptedPattern || undefined}
      />
    </PDFViewer>
  );
}
