export const DEFAULT_RECEIPT_CSS = `
body {
  background-color: #52525b;
  font-family: 'Inter', sans-serif;
}
.a4-page {
  width: 210mm;
  min-height: 297mm;
  background: white;
  margin: 20px auto;
  position: relative;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  overflow: hidden;
}
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    margin: 0;
    padding: 0;
    background: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .a4-page {
    margin: 0;
    box-shadow: none;
  }
  .no-print {
    display: none !important;
  }
}
/* Left dark starry border */
.left-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 25mm;
  background-color: #1a1a1a;
  background-image: radial-gradient(circle at 50% 50%, #d4af37 1px, transparent 1px), radial-gradient(circle at 20% 80%, #d4af37 1px, transparent 1px), radial-gradient(circle at 80% 20%, #d4af37 1px, transparent 1px);
  background-size: 50px 50px, 30px 30px, 40px 40px;
  z-index: 1;
}
/* Top dark header */
.top-header {
  position: relative;
  background-color: #1a1a1a;
  color: white;
  padding: 15mm 15mm 10mm 30mm;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.content-area {
  padding: 10mm 15mm 10mm 30mm;
  position: relative;
  z-index: 2;
}
.footer-bar {
  background-color: #1a1a1a;
  color: white;
  text-align: center;
  padding: 5mm;
  font-size: 10px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  padding-left: 25mm;
}
.box-input {
  border: 1px solid #000;
  padding: 4px 8px;
  background: #fcfcfc;
  min-height: 28px;
  display: flex;
  align-items: center;
  font-family: monospace;
  font-size: 14px;
}
.checkbox-item {
  display: inline-flex;
  align-items: center;
  margin-right: 15px;
  font-size: 12px;
}
.checkbox-box {
  width: 12px;
  height: 12px;
  border: 1px solid #000;
  margin-right: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 10px;
}
.checkbox-box.checked::after {
  content: 'X';
}
h2.section-title {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
}
.section-subtitle {
  font-size: 11px;
  color: #444;
  margin-left: 8px;
  font-weight: normal;
  text-transform: none;
}
`;

export const DEFAULT_RECEIPT_HTML = `
<div class="a4-page text-black">
  <div class="left-border"></div>
  
  <div class="top-header">
    <div>
      <h1 class="text-5xl font-black tracking-tighter" style="color: #d4af37;">
        HANDY<span class="text-white">LAND</span>
      </h1>
      <p class="text-[10px] mt-1 tracking-widest uppercase font-semibold text-gray-300">
        AN- UND VERKAUF • REPARATUR • ZUBEHÖR
      </p>
    </div>
    <div class="w-20 h-20 rounded-full bg-white flex items-center justify-center border-2 border-gray-300 overflow-hidden relative">
      <!-- Globe SVG -->
      <svg viewBox="0 0 100 100" class="w-full h-full text-black" fill="currentColor">
        <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 92C26.8 92 8 73.2 8 50S26.8 8 50 8s42 18.8 42 42-18.8 42-42 42z"/>
        <path d="M50 8c-14 0-26 18.8-26 42s12 42 26 42 26-18.8 26-42S64 8 50 8zm0 76c-9.6 0-18-15.6-18-34s8.4-34 18-34 18 15.6 18 34-8.4 34-18 34z"/>
        <path d="M8 50h84M24 30h52M24 70h52"/>
      </svg>
      <!-- Phone SVG Overlay -->
      <div class="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 24 24" class="w-10 h-10 text-yellow-500 transform rotate-12" fill="currentColor" stroke="black" stroke-width="1">
          <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 18c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm4-3H8V5h8v12z"/>
        </svg>
      </div>
    </div>
  </div>

  <div class="content-area space-y-6">
    <!-- Section 1: PERSÖNLICHEN DATEN -->
    <div>
      <div class="flex items-baseline mb-2">
        <h2 class="section-title">IHRE PERSÖNLICHEN DATEN</h2>
        <span class="section-subtitle">Diese Felder bitte <strong>selbst ausfüllen</strong>.</span>
      </div>
      
      <div class="grid grid-cols-[130px_1fr] gap-y-2 items-center text-xs">
        <div>Vorname, Nachname</div>
        <div class="box-input">{{customerName}}</div>
        
        <div>Telefon Nr./E-Mail</div>
        <div class="box-input">{{customerPhone}} / {{customerEmail}}</div>
        
        <div>Handypasswort</div>
        <div class="grid grid-cols-[1fr_120px_60px] gap-2 items-stretch">
          <div class="box-input text-gray-500 relative">
            <span class="absolute left-2 top-1 text-[8px] text-gray-400">Passwort</span>
            <div class="mt-2 text-black">{{devicePassword}}</div>
          </div>
          <div class="box-input text-gray-500 relative">
            <span class="absolute left-2 top-1 text-[8px] text-gray-400">SIM-Pin</span>
            <div class="mt-2 text-black">{{simPin}}</div>
          </div>
          <div class="border border-black p-1 flex items-center justify-center bg-[#fcfcfc] relative overflow-hidden" style="min-width: 60px; min-height: 40px;">
            {{devicePatternSvg}}
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: GERÄTEDATEN -->
    <div>
      <div class="flex items-baseline mb-2">
        <h2 class="section-title">IHRE GERÄTEDATEN</h2>
        <span class="section-subtitle">Diese Felder bitte <strong>selbst ausfüllen</strong>.</span>
      </div>
      
      <div class="grid grid-cols-[130px_1fr_120px] gap-y-2 items-center text-xs">
        <div>Hersteller, Modell</div>
        <div class="box-input mr-4">{{deviceModel}}</div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center">
            <span class="w-16">SIM Karte</span>
            <div class="checkbox-box {{hasSimCardYes}}"></div> <span class="mr-2">Ja</span>
            <div class="checkbox-box {{hasSimCardNo}}"></div> <span>Nein</span>
          </div>
          <div class="flex items-center">
            <span class="w-16">Hülle</span>
            <div class="checkbox-box {{hasCaseYes}}"></div> <span class="mr-2">Ja</span>
            <div class="checkbox-box {{hasCaseNo}}"></div> <span>Nein</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: AUFNAHMEPROTOKOLL -->
    <div>
      <div class="flex items-baseline mb-2 border-t pt-4">
        <h2 class="section-title">AUFNAHMEPROTOKOLL</h2>
        <span class="section-subtitle">Bitte von Ihrem <strong>Serviceberater</strong> ausfüllen lassen.</span>
      </div>
      
      <div class="text-xs space-y-4">
        <div class="flex items-center">
          <span>Wurde das Gerät in der Vergangenheit bereits repariert?</span>
          <div class="checkbox-box ml-2 {{hadPreviousRepairsNo}}"></div> <span class="mr-2">Nein.</span>
          <div class="checkbox-box {{hadPreviousRepairsYes}}"></div> <span>Ja , am Gerät wurden folgende Reparaturen in der Vergangenheit vorgenommen:</span>
        </div>
        <div class="border-b border-black w-full h-4 relative">
          <span class="absolute bottom-0 text-xs italic text-blue-800">{{previousRepairsDesc}}</span>
        </div>
        
        <div>
          <span>Bestehende <strong>optische Mängel</strong> vor der Übergabe an unseren Serviceberater:</span>
          <div class="border-b border-black w-full h-5 relative mt-1">
            <span class="absolute bottom-0 text-xs italic text-blue-800">
              {{conditionNotes}}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-[130px_1fr] gap-2 pt-2">
          <div>Defekt, Fehler oder<br/>Problem am Gerät:</div>
          <div class="space-y-2">
            <div>
              <div class="checkbox-item"><div class="checkbox-box {{issue_SPEAKER}}"></div>Lautsprecher</div>
              <div class="checkbox-item"><div class="checkbox-box {{issue_EARPIECE}}"></div>Ohrmuschel</div>
              <div class="checkbox-item"><div class="checkbox-box {{issue_MICROPHONE}}"></div>Mikrofon</div>
            </div>
            <div>
              <div class="checkbox-item"><div class="checkbox-box {{issue_DISPLAY}}"></div>Display</div>
              <div class="checkbox-item"><div class="checkbox-box {{issue_BACK_COVER}}"></div>Back Cover</div>
              <div class="checkbox-item"><div class="checkbox-box {{issue_BATTERY}}"></div>Akku</div>
              <div class="checkbox-item"><div class="checkbox-box {{issue_CHARGING_PORT}}"></div>Ladebuchse</div>
              <div class="checkbox-item"><div class="checkbox-box {{issue_WATER_DAMAGE}}"></div>Wasserschaden</div>
            </div>
            <div class="flex items-center">
              <div class="checkbox-box {{issue_OTHER}}"></div> <span class="mr-2">sonstiges:</span>
              <div class="border-b border-black flex-1 relative">
                <span class="absolute bottom-0 text-xs italic text-blue-800">
                  {{otherIssues}}
                </span>
              </div>
            </div>
          </div>
          
          <div class="mt-2">Zeitaufwand für Ihre<br/>Reparatur:</div>
          <div class="flex flex-wrap mt-2">
            <div class="checkbox-item"><div class="checkbox-box"></div>30 min</div>
            <div class="checkbox-item"><div class="checkbox-box"></div>45 min</div>
            <div class="checkbox-item"><div class="checkbox-box"></div>1h</div>
            <div class="checkbox-item"><div class="checkbox-box"></div>1,5 h</div>
            <div class="checkbox-item"><div class="checkbox-box"></div>2 h</div>
            <div class="checkbox-item"><div class="checkbox-box"></div>2,5</div>
            <div class="checkbox-item"><div class="checkbox-box"></div>3 h</div>
            <div class="checkbox-item"><div class="checkbox-box"></div>4 h</div>
          </div>
          
          <div class="mt-2">Abholtermin:</div>
          <div class="box-input mt-2">
            {{pickupDate}}
          </div>
          
          <div class="mt-2">Unterschrift des<br/>Serviceberater:</div>
          <div class="grid grid-cols-[1fr_150px] gap-4 mt-2">
            <div class="box-input h-12"></div>
            <div class="box-input h-12 relative text-right items-end justify-end">
              <span class="absolute left-2 top-1 text-[8px] text-gray-500">Preis (inklusive MwSt):</span>
              <span class="font-bold text-lg">{{estimatedPrice}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 4: Legal Text -->
    <div class="text-[9px] leading-tight text-gray-700 space-y-2 mt-4 text-justify">
      <p>
        Hiermit beauftrage ich den HANDYLAND Service um alle Arbeiten gemäß obigen Informationen am Gerät durchzuführen. Das Gerät hat keine Beschädigungen außer der oben angegebenen. <strong>Ich bin mir bewusst, dass gespeicherte Daten, Programme und Lizenzen im Rahmen der Reparatur verloren gehen können und mache den HANDYLAND Service nicht für Datenverlust haftbar.</strong> Aller Angaben erfolgen ohne Gewähr. Alle Rechte vorbehalten.
      </p>
      <p>
        <strong>Wir weisen darauf hin, dass trotz größter Sorgfalt, gespeicherte Daten auf Ihrem Gerät verloren gehen können. Sorgen Sie bitte dafür, dass Ihre Daten gesichert sind und Teile kaputt gehen können.</strong>
      </p>
      <p>
        HANDYLAND haftet NICHT für andere Teile im/am Gerät, die durch Tausch/Reparatur kaputt gehen können. Wir haften NUR auf die von uns getauschten und/oder bei uns gekauften Teile. Keine Haftung bei Software- oder Datenproblem.
      </p>
      <p>
        <strong>Wenn das Gerät nicht innerhalb von 10 Werktagen ab dem vorher vereinbarten Abholtermin abgeholt wird, so fällt bei der Abholung eine Aufwandspauschale von 10€ an.</strong>
      </p>
    </div>

    <!-- Section 5: Signature -->
    <div class="grid grid-cols-[130px_1fr] gap-4 mt-4">
      <div>
        <div class="text-[10px]">Datum:</div>
        <div class="box-input mt-1">{{createdAt}}</div>
        
        <div class="text-[10px] mt-2">Unterschrift des<br/>Kunden:</div>
      </div>
      <div>
        <div class="text-[10px]">
          Mit meiner Unterschrift <strong>akzeptiere ich die Bedingungen</strong> auf diesem Dokument und <strong>bestätige den Reparaturauftrag</strong>.
        </div>
        <div class="box-input h-16 mt-1 relative overflow-hidden flex items-center justify-center bg-white">
          {{signatureImage}}
        </div>
        <p class="text-[8px] text-gray-500 mt-1">Ticket: {{ticketNumber}}</p>
      </div>
    </div>
    
  </div>

  <!-- Footer -->
  <div class="footer-bar tracking-widest">
    WIR HOFFEN, IHR GERÄT IST BALD WIEDER EINSATZBEREIT! <strong>DANKE FÜR IHR VERTRAUEN.</strong>
  </div>
</div>
`;
