export const DEFAULT_RECEIPT_CSS = `
body {
    font-family: 'Inter', sans-serif;
    background-color: #f3f4f6; /* light gray background */
}

/* Print styles to ensure it looks exactly like a paper form when printed */
@media print {
    body {
        background-color: white !important;
        padding: 0;
        margin: 0;
    }
    .no-print {
        display: none !important;
    }
    .print-container {
        box-shadow: none !important;
        max-width: 100% !important;
        margin: 0 !important;
        border: none !important;
    }
    /* Force background colors to print */
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
}

/* Custom styles for inputs to look like the printed boxes */
.form-input {
    border: 1px solid #4b5563;
    background-color: transparent;
    padding: 0.25rem 0.5rem;
    width: 100%;
    outline: none;
    min-height: 32px;
}
.form-input:focus {
    border-color: #000;
    background-color: #f9fafb;
}

.form-line {
    border-bottom: 1px solid #4b5563;
    background-color: transparent;
    width: 100%;
    outline: none;
}
`;

export const DEFAULT_RECEIPT_HTML = `
<div class="print-container bg-white w-full max-w-[800px] shadow-2xl relative overflow-hidden text-gray-900 mx-auto">
    <!-- Header -->
    <header class="bg-[#1a1a1a] text-white p-6 md:px-10 relative flex justify-between items-center overflow-hidden">
        <!-- Simulated starry background effect -->
        <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(#fbbf24 1px, transparent 1px); background-size: 20px 20px;"></div>
        
        <div class="relative z-10">
            <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
                <span class="text-yellow-400">HANDY</span>LAND
            </h1>
            <p class="text-sm md:text-base uppercase tracking-widest mt-1 font-semibold text-gray-300">
                An- und Verkauf • Reparatur • Zubehör
            </p>
        </div>
        
        <!-- Globe / Phone Icon -->
        <div class="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center p-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-12 h-12 text-gray-800">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 009-9H3a9 9 0 009 9z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3a9 9 0 019 9H3a9 9 0 019-9z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-2.3 0-4.3 3.6-4.9 8.2h9.8C16.3 6.6 14.3 3 12 3z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-2.3 0-4.3-3.6-4.9-8.2h9.8c-.6 4.6-2.6 8.2-4.9 8.2z" />
                <!-- Phone shape over globe -->
                <rect x="9" y="5" width="6" height="14" rx="1" fill="#1a1a1a" stroke="#fbbf24" stroke-width="1.5" />
            </svg>
        </div>
    </header>

    <main class="p-6 md:px-10 space-y-6">
        <!-- Section 1: Personal Data -->
        <section>
            <div class="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-4">
                <h2 class="text-lg font-bold uppercase tracking-wide m-0">Ihre persönlichen Daten</h2>
                <span class="text-xs text-gray-600">Diese Felder bitte <span class="font-bold">selbst ausfüllen.</span></span>
            </div>
            
            <div class="space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center">
                    <label class="w-48 text-sm font-medium text-gray-700">Vorname, Nachname</label>
                    <div class="form-input flex-1 flex items-center font-bold">{{customerName}}</div>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:items-center">
                    <label class="w-48 text-sm font-medium text-gray-700">Telefon Nr./E-Mail</label>
                    <div class="form-input flex-1 flex items-center font-bold">{{customerPhone}} / {{customerEmail}}</div>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:items-start pt-1">
                    <label class="w-48 text-sm font-medium text-gray-700 pt-2">Handypasswort</label>
                    <div class="flex-1 flex gap-4 items-start">
                        <div class="form-input w-1/2 text-gray-500 relative flex items-center font-bold pt-4">
                            <span class="absolute left-2 top-1 text-[8px] text-gray-400 font-normal">Passwort</span>
                            <div class="text-black">{{devicePassword}}</div>
                        </div>
                        <div class="form-input w-1/3 text-gray-500 relative flex items-center font-bold pt-4">
                            <span class="absolute left-2 top-1 text-[8px] text-gray-400 font-normal">SIM-Pin</span>
                            <div class="text-black">{{simPin}}</div>
                        </div>
                        
                        <!-- Pattern Lock visual -->
                        <div class="border border-gray-500 bg-white relative overflow-hidden flex items-center justify-center" style="width: 70px; height: 70px; min-width: 70px;">
                            {{devicePatternSvg}}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <hr class="border-gray-300">

        <!-- Section 2: Device Data -->
        <section>
            <div class="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-4">
                <h2 class="text-lg font-bold uppercase tracking-wide m-0">Ihre Gerätedaten</h2>
                <span class="text-xs text-gray-600">Diese Felder bitte <span class="font-bold">selbst ausfüllen.</span></span>
            </div>

            <div class="flex flex-col md:flex-row md:items-center gap-6">
                <div class="flex-1 flex flex-col sm:flex-row sm:items-center">
                    <label class="w-40 text-sm font-medium text-gray-700">Hersteller, Modell</label>
                    <div class="form-input flex-1 flex items-center font-bold">{{deviceModel}}</div>
                </div>
                
                <div class="flex flex-col gap-2 min-w-[150px]">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-700 mr-2">SIM Karte</span>
                        <div class="flex gap-3">
                            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{hasSimCardYes}} onclick="return false;"> Ja</label>
                            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{hasSimCardNo}} onclick="return false;"> Nein</label>
                        </div>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-700 mr-2">Hülle</span>
                        <div class="flex gap-3">
                            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{hasCaseYes}} onclick="return false;"> Ja</label>
                            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{hasCaseNo}} onclick="return false;"> Nein</label>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <hr class="border-gray-300">

        <!-- Section 3: Protocol -->
        <section class="bg-gray-50 -mx-6 px-6 py-4 md:-mx-10 md:px-10 border-y border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-4">
                <h2 class="text-lg font-bold uppercase tracking-wide m-0">Aufnahmeprotokoll</h2>
                <span class="text-xs text-gray-600">Bitte von Ihrem <span class="font-bold">Serviceberater</span> ausfüllen lassen.</span>
            </div>

            <div class="space-y-4 text-sm">
                <!-- Text lines -->
                <div>
                    <p class="inline">Wurde das Gerät in der Vergangenheit bereits repariert? </p>
                    <label class="inline-flex items-center mx-2 cursor-pointer"><input type="checkbox" class="w-3 h-3 border-gray-500 rounded-none mr-1 accent-black" {{hadPreviousRepairsNo}} onclick="return false;"> Nein.</label>
                    <label class="inline-flex items-center cursor-pointer"><input type="checkbox" class="w-3 h-3 border-gray-500 rounded-none mr-1 accent-black" {{hadPreviousRepairsYes}} onclick="return false;"> Ja, am Gerät wurden folgende</label>
                    <p class="inline font-bold">Reparaturen in der Vergangenheit</p> vorgenommen:
                    <div class="form-line mt-1 flex items-end min-h-[24px] text-blue-800 italic font-medium px-1">{{previousRepairsDesc}}</div>
                </div>

                <div class="flex items-end gap-2">
                    <p class="whitespace-nowrap">Bestehende <span class="font-bold">optische Mängel</span> vor der Übergabe an unseren Serviceberater:</p>
                    <div class="form-line flex-1 min-h-[24px] text-blue-800 italic font-medium px-1">{{conditionNotes}}</div>
                </div>

                <hr class="border-gray-300 my-4">

                <!-- Defects Table -->
                <div class="flex flex-col md:flex-row gap-4 py-2">
                    <div class="w-48 font-medium text-gray-700">Defekt, Fehler oder<br>Problem am Gerät:</div>
                    <div class="flex-1 space-y-3">
                        <div class="flex flex-wrap gap-4">
                            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{issue_SPEAKER}} onclick="return false;"> Lautsprecher</label>
                            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{issue_EARPIECE}} onclick="return false;"> Ohrmuschel</label>
                            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{issue_MICROPHONE}} onclick="return false;"> Mikrofon</label>
                        </div>
                        <div class="flex flex-wrap gap-4">
                            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{issue_DISPLAY}} onclick="return false;"> Display</label>
                            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{issue_BACK_COVER}} onclick="return false;"> Back Cover</label>
                            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{issue_BATTERY}} onclick="return false;"> Akku</label>
                            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{issue_CHARGING_PORT}} onclick="return false;"> Ladebuchse</label>
                            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{issue_WATER_DAMAGE}} onclick="return false;"> Wasserschaden</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <label class="flex items-center gap-1 cursor-pointer whitespace-nowrap"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{issue_OTHER}} onclick="return false;"> sonstiges:</label>
                            <div class="form-line flex-1 min-h-[24px] text-blue-800 italic font-medium px-1">{{otherIssues}}</div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row gap-4 items-center mt-2">
                    <div class="w-48 font-medium text-gray-700">Zeitaufwand für Ihre<br>Reparatur:</div>
                    <div class="flex-1 flex flex-wrap gap-4">
                        <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{time_30min}} onclick="return false;"> 30 min</label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{time_45min}} onclick="return false;"> 45 min</label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{time_1h}} onclick="return false;"> 1h</label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{time_1_5h}} onclick="return false;"> 1,5 h</label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{time_2h}} onclick="return false;"> 2 h</label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{time_2_5h}} onclick="return false;"> 2,5 h</label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{time_3h}} onclick="return false;"> 3 h</label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="w-4 h-4 border-gray-500 rounded-none accent-black" {{time_4h}} onclick="return false;"> 4 h</label>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row gap-4 items-center mt-4">
                    <div class="w-48 font-medium text-gray-700">Abholtermin:</div>
                    <div class="flex-1">
                        <div class="form-input bg-white h-10 flex items-center font-bold">{{pickupDate}}</div>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row gap-4 mt-4">
                    <div class="w-48 font-medium text-gray-700">Unterschrift des<br>Serviceberater:</div>
                    <div class="flex-1 flex gap-4">
                        <div class="flex-1 border border-gray-500 h-16 bg-white relative overflow-hidden flex items-center justify-center">
                            {{adminSignatureImage}}
                        </div>
                        <div class="w-32 border border-gray-500 h-16 bg-white p-1 flex flex-col justify-end relative">
                            <span class="absolute left-1 top-1 text-[10px] text-gray-500">Preis (inklusive MwSt):</span>
                            <div class="w-full text-right outline-none font-bold text-lg bg-transparent">{{estimatedPrice}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Terms and Conditions -->
        <section class="text-[10px] md:text-[11px] leading-snug text-gray-600 space-y-2 text-justify">
            <p>
                Hiermit beauftrage ich den HANDYLAND Service um alle Arbeiten gemäß obigen Informationen am Gerät durchzuführen. 
                Das Gerät hat keine Beschädigungen außer der oben angegebenen. 
                <strong class="text-gray-800">Ich bin mir bewusst, dass gespeicherte Daten, Programme und Lizenzen im Rahmen der Reparatur verloren gehen können 
                und mache den HANDYLAND Service nicht für Datenverlust haftbar.</strong> Aller Angaben erfolgen ohne Gewähr. Alle Rechte vorbehalten.
            </p>
            <p class="font-bold text-gray-800">
                Wir weisen darauf hin, dass trotz größter Sorgfalt, gespeicherte Daten auf Ihrem Gerät verloren gehen können. 
                Sorgen Sie bitte dafür, dass Ihre Daten gesichert sind und Teile kaputt gehen können.
            </p>
            <p>
                HANDYLAND haftet NICHT für andere Teile im/am Gerät, die durch Tausch/Reparatur kaputt gehen können. 
                Wir haften NUR auf die von uns getauschten und/oder bei uns gekauften Teile. Keine Haftung bei Software- oder Datenproblem.
            </p>
            <p class="font-bold text-gray-800">
                Wenn das Gerät nicht innerhalb von 10 Werktagen ab dem vorher vereinbarten Abholtermin abgeholt wird, 
                so fällt bei der Abholung eine Aufwandspauschale von 10€ an.
            </p>
        </section>

        <!-- Customer Signature -->
        <section class="flex gap-4 pt-1">
            <div class="w-32 flex flex-col gap-1">
                <label class="text-xs text-gray-700">Datum:</label>
                <div class="form-input h-8 bg-gray-200 flex items-center font-bold text-sm">{{createdAt}}</div>
            </div>
            <div class="flex-1 flex flex-col gap-1">
                <label class="text-xs text-gray-700 flex gap-2">
                    Unterschrift des Kunden:
                    <span class="text-[11px] font-normal mt-0.5 text-gray-800 leading-tight">
                        Mit meiner Unterschrift <strong>akzeptiere ich die Bedingungen</strong><br>
                        auf diesem Dokument und <strong>bestätige den Reparaturauftrag.</strong>
                    </span>
                </label>
                <div class="border border-gray-500 h-16 bg-white w-full relative overflow-hidden flex items-center justify-center">
                    {{signatureImage}}
                    <span class="absolute bottom-1 right-2 text-[8px] text-gray-400">Ticket: {{ticketNumber}}</span>
                </div>
            </div>
        </section>

    </main>

    <!-- Footer Banner -->
    <footer class="bg-[#1a1a1a] text-gray-300 text-center py-4 text-[10px] md:text-xs font-semibold tracking-wide uppercase">
        Wir hoffen, Ihr Gerät ist bald wieder einsatzbereit! <span class="text-white font-bold">Danke für Ihr Vertrauen.</span>
    </footer>

</div>
`;
