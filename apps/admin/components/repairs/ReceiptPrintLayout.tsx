import React from "react";
import { format } from "date-fns";

export interface ReceiptConfig {
  // Branding
  logoUrl?: string;
  shopNameMain: string;
  shopNameSub: string;
  headerSubtitle: string;
  
  // Section 1: Customer
  sec1Title: string;
  sec1Sub1: string;
  sec1Sub2: string;
  lblCustomerName: string;
  lblPhoneEmail: string;
  lblPassword: string;
  lblPasswordSub: string;
  lblSimPin: string;

  // Section 2: Device
  sec2Title: string;
  sec2Sub: string;
  lblDevice: string;
  lblSimCard: string;
  lblCase: string;
  lblYes: string;
  lblNo: string;

  // Section 3: Protocol
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
  
  // Defects
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

  // Repair details
  lblTimeEstimate: string;
  lblPickupDate: string;
  lblAdminSignature: string;
  lblPrice: string;

  // Legal
  legalParagraph1: string;
  legalParagraph2: string;
  legalParagraph3: string;
  legalParagraph4: string;

  // Signatures
  lblDate: string;
  lblCustomerSignature: string;
  txtCustSig1: string;
  txtCustSigBold1: string;
  txtCustSig2: string;
  txtCustSigBold2: string;
  lblTicket: string;

  // Footer
  footerText: string;
}

export const DEFAULT_RECEIPT_CONFIG: ReceiptConfig = {
  logoUrl: "",
  shopNameMain: "HANDY",
  shopNameSub: "LAND",
  headerSubtitle: "An- und Verkauf • Reparatur • Zubehör",
  
  sec1Title: "Ihre persönlichen Daten",
  sec1Sub1: "Diese Felder bitte ",
  sec1Sub2: "selbst ausfüllen.",
  lblCustomerName: "Vorname, Nachname",
  lblPhoneEmail: "Telefon Nr./E-Mail",
  lblPassword: "Handypasswort",
  lblPasswordSub: "Passwort",
  lblSimPin: "SIM-Pin",

  sec2Title: "Ihre Gerätedaten",
  sec2Sub: "Diese Felder bitte selbst ausfüllen.",
  lblDevice: "Hersteller, Modell",
  lblSimCard: "SIM Karte",
  lblCase: "Hülle",
  lblYes: "Ja",
  lblNo: "Nein",

  sec3Title: "Aufnahmeprotokoll",
  sec3Sub: "Bitte von Ihrem Serviceberater ausfüllen lassen.",
  txtPrevRepairsQ: "Wurde das Gerät in der Vergangenheit bereits repariert? ",
  txtPrevRepairsNo: "Nein.",
  txtPrevRepairsYes: "Ja, am Gerät wurden folgende",
  txtPrevRepairsBold: "Reparaturen in der Vergangenheit",
  txtPrevRepairsEnd: "vorgenommen:",
  txtCondBefore: "Bestehende ",
  txtCondBold: "optische Mängel",
  txtCondAfter: " vor der Übergabe an unseren Serviceberater:",
  
  lblDefects: "Defekt, Fehler oder Problem am Gerät:",
  defSpeaker: "Lautsprecher",
  defEarpiece: "Ohrmuschel",
  defMic: "Mikrofon",
  defDisplay: "Display",
  defBackCover: "Back Cover",
  defBattery: "Akku",
  defChargingPort: "Ladebuchse",
  defWaterDamage: "Wasserschaden",
  defOther: "sonstiges:",

  lblTimeEstimate: "Zeitaufwand für Ihre Reparatur:",
  lblPickupDate: "Abholtermin:",
  lblAdminSignature: "Unterschrift des Serviceberater:",
  lblPrice: "Preis (inklusive MwSt):",

  legalParagraph1: "Hiermit beauftrage ich den HANDYLAND Service um alle Arbeiten gemäß obigen Informationen am Gerät durchzuführen. Das Gerät hat keine Beschädigungen außer der oben angegebenen. Ich bin mir bewusst, dass gespeicherte Daten, Programme und Lizenzen im Rahmen der Reparatur verloren gehen können und mache den HANDYLAND Service nicht für Datenverlust haftbar. Aller Angaben erfolgen ohne Gewähr. Alle Rechte vorbehalten.",
  legalParagraph2: "Wir weisen darauf hin, dass trotz größter Sorgfalt, gespeicherte Daten auf Ihrem Gerät verloren gehen können. Sorgen Sie bitte dafür, dass Ihre Daten gesichert sind und Teile kaputt gehen können.",
  legalParagraph3: "HANDYLAND haftet NICHT für andere Teile im/am Gerät, die durch Tausch/Reparatur kaputt gehen können. Wir haften NUR auf die von uns getauschten und/oder bei uns gekauften Teile. Keine Haftung bei Software- oder Datenproblem.",
  legalParagraph4: "Wenn das Gerät nicht innerhalb von 10 Werktagen ab dem vorher vereinbarten Abholtermin abgeholt wird, so fällt bei der Abholung eine Aufwandspauschale von 10€ an.",

  lblDate: "Datum:",
  lblCustomerSignature: "Unterschrift des Kunden:",
  txtCustSig1: "Mit meiner Unterschrift ",
  txtCustSigBold1: "akzeptiere ich die Bedingungen",
  txtCustSig2: "auf diesem Dokument und ",
  txtCustSigBold2: "bestätige den Reparaturauftrag.",
  lblTicket: "Ticket:",

  footerText: "Wir hoffen, Ihr Gerät ist bald wieder einsatzbereit! Danke für Ihr Vertrauen.",
};

export function ReceiptPrintLayout({ repair, config }: { repair: any; config: ReceiptConfig }) {
  const c = { ...DEFAULT_RECEIPT_CONFIG, ...config }; // Merge with defaults for missing fields

  const hasIssue = (type: string) => repair?.issues?.some((i: any) => i.issueType === type);
  
  const generatePatternSvg = (patternStr: string | null) => {
    if (!patternStr) return null;
    const points = [
      { x: 10, y: 10 }, { x: 30, y: 10 }, { x: 50, y: 10 },
      { x: 10, y: 30 }, { x: 30, y: 30 }, { x: 50, y: 30 },
      { x: 10, y: 50 }, { x: 30, y: 50 }, { x: 50, y: 50 },
    ];
    const indices = patternStr.split(",").map(Number).filter(n => !isNaN(n) && n >= 0 && n <= 8);
    if (indices.length === 0) return null;
    
    return (
      <svg viewBox="0 0 60 60" width="100%" height="100%" style={{ display: 'block', maxWidth: '40px', margin: 'auto' }}>
        <path d={indices.map((idx, i) => `${i === 0 ? 'M' : 'L'} ${points[idx]?.x} ${points[idx]?.y}`).join(" ")} fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => {
          const isSelected = indices.includes(i);
          return <circle key={i} cx={p.x} cy={p.y} r={isSelected ? 3 : 1.5} fill={isSelected ? 'black' : '#999'} />;
        })}
      </svg>
    );
  };

  const isChecked = (val: boolean) => val;

  const getConditionNotes = () => {
    if (!repair) return "";
    return [
      ...(repair.conditionItems?.map((c: any) => c.condition) || []),
      repair.conditionNotes || ""
    ].filter(Boolean).join(" - ");
  };

  const getOtherIssues = () => {
    if (!repair) return "";
    return [
      ...(repair.issues?.filter((i: any) => !['SPEAKER','EARPIECE','MICROPHONE','DISPLAY','BACK_COVER','BATTERY','CHARGING_PORT','WATER_DAMAGE'].includes(i.issueType)).map((i: any) => i.issueType) || []),
      repair.problemDescription || ""
    ].filter(Boolean).join(", ");
  };

  const renderValue = (val: any) => val || "";

  return (
    <div className="print-container bg-white w-full max-w-[800px] shadow-2xl relative overflow-hidden text-gray-900 mx-auto font-sans" style={{ minHeight: "297mm", maxHeight: "297mm" }}>
      {/* Header */}
      <header className="bg-[#1a1a1a] text-white p-6 md:px-10 relative flex justify-between items-center overflow-hidden h-[130px]">
        {/* Simulated starry background effect */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight m-0 leading-tight">
            <span className="text-yellow-400">{c.shopNameMain}</span>{c.shopNameSub}
          </h1>
          <p className="text-sm md:text-base uppercase tracking-widest mt-1 font-semibold text-gray-300">
            {c.headerSubtitle}
          </p>
        </div>
        
        {/* Logo / Icon */}
        <div className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center p-2 border-2 border-gray-300 shrink-0 ml-4 overflow-hidden">
          {c.logoUrl ? (
            <img src={c.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-full" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-gray-800">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 009-9H3a9 9 0 009 9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 019 9H3a9 9 0 019-9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-2.3 0-4.3 3.6-4.9 8.2h9.8C16.3 6.6 14.3 3 12 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-2.3 0-4.3-3.6-4.9-8.2h9.8c-.6 4.6-2.6 8.2-4.9 8.2z" />
              <rect x="9" y="5" width="6" height="14" rx="1" fill="#1a1a1a" stroke="#fbbf24" strokeWidth="1.5" />
            </svg>
          )}
        </div>
      </header>

      <main className="p-6 md:px-10 space-y-4">
        {/* Section 1: Personal Data */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
            <h2 className="text-lg font-bold uppercase tracking-wide m-0">{c.sec1Title}</h2>
            <span className="text-xs text-gray-600">{c.sec1Sub1}<span className="font-bold">{c.sec1Sub2}</span></span>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="w-48 text-sm font-medium text-gray-700">{c.lblCustomerName}</label>
              <div className="border border-gray-600 bg-transparent px-2 min-h-[32px] flex-1 flex items-center font-bold">
                {repair?.customer ? `${repair.customer.firstName} ${repair.customer.lastName}` : ""}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="w-48 text-sm font-medium text-gray-700">{c.lblPhoneEmail}</label>
              <div className="border border-gray-600 bg-transparent px-2 min-h-[32px] flex-1 flex items-center font-bold">
                {repair?.customer ? `${repair.customer.phone || ""} / ${repair.customer.email || ""}` : ""}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start pt-1">
              <label className="w-48 text-sm font-medium text-gray-700 pt-2">{c.lblPassword}</label>
              <div className="flex-1 flex gap-4 items-start">
                <div className="border border-gray-600 bg-transparent px-2 min-h-[38px] w-1/2 text-gray-500 relative flex items-center font-bold pt-4">
                  <span className="absolute left-2 top-1 text-[8px] text-gray-400 font-normal">{c.lblPasswordSub}</span>
                  <div className="text-black leading-tight">{renderValue(repair?.devicePasswordEncrypted)}</div>
                </div>
                <div className="border border-gray-600 bg-transparent px-2 min-h-[38px] w-1/3 text-gray-500 relative flex items-center font-bold pt-4">
                  <span className="absolute left-2 top-1 text-[8px] text-gray-400 font-normal">{c.lblSimPin}</span>
                  <div className="text-black leading-tight">{renderValue(repair?.simPinEncrypted)}</div>
                </div>
                
                <div className="border border-gray-600 bg-white relative overflow-hidden flex items-center justify-center" style={{ width: '70px', height: '70px', minWidth: '70px' }}>
                  {generatePatternSvg(repair?.devicePatternEncrypted)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-gray-300" />

        {/* Section 2: Device Data */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
            <h2 className="text-lg font-bold uppercase tracking-wide m-0">{c.sec2Title}</h2>
            <span className="text-xs text-gray-600">{c.sec2Sub}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center">
              <label className="w-40 text-sm font-medium text-gray-700">{c.lblDevice}</label>
              <div className="border border-gray-600 bg-transparent px-2 min-h-[32px] flex-1 flex items-center font-bold">
                {repair?.device ? `${repair.device.manufacturer} ${repair.device.model}` : ""}
              </div>
            </div>
            
            <div className="flex flex-col gap-2 min-w-[150px]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 mr-2">{c.lblSimCard}</span>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={isChecked(repair?.hasSimCard)} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {c.lblYes}</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={!isChecked(repair?.hasSimCard)} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {c.lblNo}</label>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 mr-2">{c.lblCase}</span>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={isChecked(repair?.hasCase)} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {c.lblYes}</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={!isChecked(repair?.hasCase)} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {c.lblNo}</label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-gray-300" />

        {/* Section 3: Protocol */}
        <section className="bg-gray-50 -mx-6 px-6 py-4 md:-mx-10 md:px-10 border-y border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
            <h2 className="text-lg font-bold uppercase tracking-wide m-0">{c.sec3Title}</h2>
            <span className="text-xs text-gray-600">{c.sec3Sub}</span>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="inline">{c.txtPrevRepairsQ}</p>
              <label className="inline-flex items-center mx-2 cursor-pointer"><input type="checkbox" checked={!isChecked(repair?.hadPreviousRepairs)} className="w-3 h-3 border-gray-500 rounded-none mr-1 accent-black" readOnly /> {c.txtPrevRepairsNo}</label>
              <label className="inline-flex items-center cursor-pointer"><input type="checkbox" checked={isChecked(repair?.hadPreviousRepairs)} className="w-3 h-3 border-gray-500 rounded-none mr-1 accent-black" readOnly /> {c.txtPrevRepairsYes}</label>
              <p className="inline font-bold mx-1">{c.txtPrevRepairsBold}</p> {c.txtPrevRepairsEnd}
              <div className="border-b border-gray-600 mt-1 min-h-[24px] text-blue-800 italic font-medium px-1 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{renderValue(repair?.previousRepairsDesc)}</div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <p className="whitespace-nowrap pt-1">{c.txtCondBefore}<span className="font-bold">{c.txtCondBold}</span>{c.txtCondAfter}</p>
              <div className="border-b border-gray-600 flex-1 min-h-[24px] text-blue-800 italic font-medium px-1 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{getConditionNotes()}</div>
            </div>

            <hr className="border-gray-300 my-4" />

            <div className="flex flex-col md:flex-row gap-4 py-2">
              <div className="w-48 font-medium text-gray-700">{c.lblDefects.split('\\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</div>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={hasIssue('SPEAKER')} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {c.defSpeaker}</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={hasIssue('EARPIECE')} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {c.defEarpiece}</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={hasIssue('MICROPHONE')} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {c.defMic}</label>
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={hasIssue('DISPLAY')} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {c.defDisplay}</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={hasIssue('BACK_COVER')} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {c.defBackCover}</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={hasIssue('BATTERY')} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {c.defBattery}</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={hasIssue('CHARGING_PORT')} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {c.defChargingPort}</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={hasIssue('WATER_DAMAGE')} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {c.defWaterDamage}</label>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap pt-1"><input type="checkbox" checked={hasIssue('OTHER') || getOtherIssues() !== ""} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {c.defOther}</label>
                  <div className="border-b border-gray-600 flex-1 min-h-[24px] text-blue-800 italic font-medium px-1 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{getOtherIssues()}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center mt-2">
              <div className="w-48 font-medium text-gray-700">{c.lblTimeEstimate.split('\\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</div>
              <div className="flex-1 flex flex-wrap gap-4">
                {["30min", "45min", "1h", "1.5h", "2h", "2.5h", "3h", "4h"].map((time, idx) => {
                  const displayTime = ["30 min", "45 min", "1 h", "1,5 h", "2 h", "2,5 h", "3 h", "4 h"][idx];
                  return (
                    <label key={time} className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={repair?.repairTimeEstimate === time} className="w-4 h-4 border-gray-500 rounded-none accent-black" readOnly /> {displayTime}
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
              <div className="w-48 font-medium text-gray-700">{c.lblPickupDate}</div>
              <div className="flex-1">
                <div className="border border-gray-600 bg-white px-2 h-10 flex items-center font-bold">
                  {repair?.pickupDate ? format(new Date(repair.pickupDate), "dd.MM.yyyy HH:mm") : ""}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="w-48 font-medium text-gray-700">{c.lblAdminSignature.split('\\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</div>
              <div className="flex-1 flex gap-4">
                <div className="flex-1 border border-gray-600 h-16 bg-white relative overflow-hidden flex items-center justify-center">
                  {repair?.adminSignatureImage ? (
                    <img src={repair.adminSignatureImage} alt="Mitarbeiterunterschrift" style={{ height: '100%', objectFit: 'contain', filter: 'invert(1)' }} />
                  ) : null}
                </div>
                <div className="w-32 border border-gray-600 h-16 bg-white p-1 flex flex-col justify-end relative shrink-0">
                  <span className="absolute left-1 top-1 text-[10px] text-gray-500">{c.lblPrice}</span>
                  <div className="w-full text-right outline-none font-bold text-lg bg-transparent">{repair?.estimatedPrice ? `€ ${repair.estimatedPrice}` : ""}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Terms and Conditions */}
        <section className="text-[10px] md:text-[11px] leading-snug text-gray-600 space-y-2 text-justify">
          <p>{c.legalParagraph1}</p>
          <p className="font-bold text-gray-800">{c.legalParagraph2}</p>
          <p>{c.legalParagraph3}</p>
          <p className="font-bold text-gray-800">{c.legalParagraph4}</p>
        </section>

        {/* Customer Signature */}
        <section className="flex gap-4 pt-1">
          <div className="w-32 flex flex-col gap-1 shrink-0">
            <label className="text-xs text-gray-700">{c.lblDate}</label>
            <div className="border border-gray-600 px-2 h-8 bg-gray-200 flex items-center font-bold text-sm">
              {repair?.createdAt ? format(new Date(repair.createdAt), "dd.MM.yyyy") : ""}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs text-gray-700 flex gap-2">
              {c.lblCustomerSignature}
              <span className="text-[11px] font-normal mt-0.5 text-gray-800 leading-tight">
                {c.txtCustSig1}<strong>{c.txtCustSigBold1}</strong><br/>
                {c.txtCustSig2}<strong>{c.txtCustSigBold2}</strong>
              </span>
            </label>
            <div className="border border-gray-600 h-16 bg-white w-full relative overflow-hidden flex items-center justify-center">
              {repair?.signatureImage ? (
                <img src={repair.signatureImage} alt="Kundenunterschrift" style={{ height: '100%', objectFit: 'contain', filter: 'invert(1)' }} />
              ) : null}
              <span className="absolute bottom-1 right-2 text-[8px] text-gray-400">{c.lblTicket} {repair?.ticketNumber || ""}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Banner */}
      <footer className="bg-[#1a1a1a] text-gray-300 text-center py-4 text-[10px] md:text-xs font-semibold tracking-wide uppercase mt-4">
        {c.footerText}
      </footer>
    </div>
  );
}
