"use client";

import React from "react";

export interface ReceiptConfig {
  logoUrl: string;
  shopNameMain: string;
  shopNameSub: string;
  headerSubtitle: string;
  sec1Title: string;
  sec1Sub1: string;
  sec1Sub2: string;
  lblCustomerName: string;
  lblPhoneEmail: string;
  lblPassword: string;
  lblPasswordSub: string;
  lblSimPin: string;
  sec2Title: string;
  sec2Sub: string;
  lblDevice: string;
  lblSimCard: string;
  lblCase: string;
  lblYes: string;
  lblNo: string;
  sec3Title: string;
  sec3Sub: string;
  txtPrevRepairsQ: string;
  txtPrevRepairsNo: string;
  txtPrevRepairsYes: string;
  txtPrevRepairsBold: string;
  txtPrevRepairsEnd: string;
  txtCondBefore: string;
  txtCondBold: string;
  txtCondAfter: string;
  lblDefects: string;
  defSpeaker: string;
  defEarpiece: string;
  defMic: string;
  defDisplay: string;
  defBackCover: string;
  defBattery: string;
  defChargingPort: string;
  defWaterDamage: string;
  defOther: string;
  lblTimeEstimate: string;
  lblPickupDate: string;
  lblPrice: string;
  lblAdminSignature: string;
  legalParagraph1: string;
  legalParagraph2: string;
  legalParagraph3: string;
  legalParagraph4: string;
  lblDate: string;
  lblTicket: string;
  lblCustomerSignature: string;
  txtCustSig1: string;
  txtCustSigBold1: string;
  txtCustSig2: string;
  txtCustSigBold2: string;
  footerText: string;
}

export const DEFAULT_RECEIPT_CONFIG: ReceiptConfig = {
  logoUrl: "",
  shopNameMain: "HANDY",
  shopNameSub: "LAND",
  headerSubtitle: "Smartphone & Tablet Reparatur | An- & Verkauf",
  sec1Title: "1. Kunden-Daten",
  sec1Sub1: "Persönliche Angaben",
  sec1Sub2: "Wichtig",
  lblCustomerName: "Kundenname",
  lblPhoneEmail: "Telefon / E-Mail",
  lblPassword: "Geräte-Passwort",
  lblPasswordSub: "PIN / Muster",
  lblSimPin: "SIM-PIN",
  sec2Title: "2. Geräte-Daten",
  sec2Sub: "Eingegangenes Gerät",
  lblDevice: "Gerätemodell",
  lblSimCard: "SIM-Karte dabei",
  lblCase: "Schutzhülle dabei",
  lblYes: "Ja",
  lblNo: "Nein",
  sec3Title: "3. Aufnahmeprotokoll",
  sec3Sub: "Zustand & Fehler",
  txtPrevRepairsQ: "Wurde das Gerät bereits vorher repariert?",
  txtPrevRepairsNo: "Nein, Erst-Reparatur",
  txtPrevRepairsYes: "Ja,",
  txtPrevRepairsBold: "Vorreparatur bekannt",
  txtPrevRepairsEnd: "",
  txtCondBefore: "Zustand:",
  txtCondBold: "Gebrauchsspuren",
  txtCondAfter: "vorhanden",
  lblDefects: "Gemeldete Defekte",
  defSpeaker: "Lautsprecher",
  defEarpiece: "Hörmuschel",
  defMic: "Mikrofon",
  defDisplay: "Display",
  defBackCover: "Rückabdeckung",
  defBattery: "Akku",
  defChargingPort: "Ladebuchse",
  defWaterDamage: "Wasserschaden",
  defOther: "Sonstiges",
  lblTimeEstimate: "Geschätzter Zeitaufwand",
  lblPickupDate: "Abholtermin",
  lblPrice: "Geschätzter Preis",
  lblAdminSignature: "Unterschrift Techniker",
  legalParagraph1: "Der Kunde bestätigt die Richtigkeit aller Angaben.",
  legalParagraph2: "Für Datenverlust wird keine Haftung übernommen.",
  legalParagraph3: "Nicht abgeholte Geräte werden nach 90 Tagen verwertet.",
  legalParagraph4: "Es gelten unsere AGB.",
  lblDate: "Datum",
  lblTicket: "Auftrags-Nr.",
  lblCustomerSignature: "Unterschrift Kunde",
  txtCustSig1: "Ich akzeptiere die",
  txtCustSigBold1: "Reparatur-Bedingungen",
  txtCustSig2: "und Erteilung des",
  txtCustSigBold2: "Reparaturauftrags",
  footerText: "Handyland ERP — Reparatur-Auftragsbestätigung",
};

export function ReceiptPrintLayout({ repair, config }: { repair: any; config?: ReceiptConfig }) {
  const cfg = config || DEFAULT_RECEIPT_CONFIG;

  return (
    <div className="p-8 bg-white text-black font-sans text-xs space-y-4 border">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">
            {cfg.shopNameMain}
            <span className="text-accent">{cfg.shopNameSub}</span>
          </h1>
          <p className="text-gray-500">{cfg.headerSubtitle}</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-sm font-bold">{repair.ticketNumber}</span>
          <p className="text-gray-400">{new Date(repair.createdAt).toLocaleDateString("de-DE")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border p-3 rounded">
          <h2 className="font-bold border-b pb-1 mb-2">{cfg.sec1Title}</h2>
          <p>
            <strong>{cfg.lblCustomerName}:</strong> {repair.customer?.firstName} {repair.customer?.lastName}
          </p>
          <p>
            <strong>{cfg.lblPhoneEmail}:</strong> {repair.customer?.phone}
          </p>
        </div>

        <div className="border p-3 rounded">
          <h2 className="font-bold border-b pb-1 mb-2">{cfg.sec2Title}</h2>
          <p>
            <strong>{cfg.lblDevice}:</strong> {repair.device?.manufacturer} {repair.device?.model}
          </p>
          <p>
            <strong>{cfg.lblPrice}:</strong> {repair.estimatedPrice} €
          </p>
        </div>
      </div>

      <div className="border p-3 rounded">
        <h2 className="font-bold border-b pb-1 mb-2">{cfg.sec3Title}</h2>
        <p>
          <strong>{cfg.lblTimeEstimate}:</strong> {repair.repairTimeEstimate || "Ca. 1h"}
        </p>
      </div>

      <div className="border-t pt-4 text-[10px] text-gray-500 justify-between flex">
        <p>{cfg.footerText}</p>
        <p>{cfg.lblTicket}: {repair.ticketNumber}</p>
      </div>
    </div>
  );
}
