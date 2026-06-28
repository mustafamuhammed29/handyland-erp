import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const colors = {
  black: '#000000',
  gold: '#F5C518',
  headerBg: '#1a1a1a',
  headerText: '#FFFFFF',
  border: '#cccccc',
  lightGray: '#f5f5f5',
};

const styles = StyleSheet.create({
  page: { padding: "40px", fontFamily: "Helvetica", fontSize: 9, color: colors.black },
  
  // Header Section
  headerSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  logoBlock: { width: "60%" },
  logoWrapper: { backgroundColor: colors.black, padding: "4px 8px", alignSelf: "flex-start", marginBottom: 4 },
  logoText: { fontSize: 24, fontWeight: "bold", color: colors.gold },
  logoSub: { fontSize: 8, letterSpacing: 1, fontWeight: "bold" },
  ticketBlock: { width: "40%", alignItems: "flex-start", paddingLeft: 20 },
  qrCode: { width: 50, height: 50, position: "absolute", top: 0, right: 0 },
  ticketRow: { flexDirection: "row", marginBottom: 4 },
  ticketLabel: { fontSize: 9, width: 40, color: "#555" },
  ticketValue: { fontSize: 10, fontWeight: "bold" },
  
  // Section Headers
  sectionHeader: {
    backgroundColor: colors.headerBg,
    color: colors.headerText,
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center"
  },
  sectionSubtitle: { fontSize: 8, color: "#aaa", marginLeft: 8, fontWeight: "normal", letterSpacing: 0, textTransform: "none" },
  
  // Form Rows
  fieldRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e0e0e0", paddingVertical: 5, paddingHorizontal: 4 },
  colHalf: { flex: 1, flexDirection: "row" },
  colFull: { width: "100%", flexDirection: "row" },
  label: { fontSize: 8, color: "#555", width: "35%" },
  value: { fontSize: 9, color: colors.black, fontWeight: "bold", width: "65%" },
  
  labelSmall: { fontSize: 8, color: "#555", width: "20%" },
  valueLarge: { fontSize: 9, color: colors.black, fontWeight: "bold", width: "80%" },

  // Checkboxes
  checkboxGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 4, gap: 10 },
  checkboxItem: { flexDirection: "row", width: "30%", marginBottom: 4 },

  // Legal
  legalText: { fontSize: 8, color: "#333", marginTop: 15, lineHeight: 1.4, textAlign: "justify" },

  // Signatures
  sigSection: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  sigBox: { width: "45%", borderTopWidth: 1, borderTopColor: colors.black, paddingTop: 4, position: "relative", minHeight: 40 },
  sigImage: { width: 120, height: 50, position: "absolute", bottom: 15, left: 10 },
  sigText: { fontSize: 8, color: "#555" },

  // Footer
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, borderTopWidth: 1, borderTopColor: "#e0e0e0", paddingTop: 6 },
});

// Using a custom checkbox instead of unicode because standard Helvetica in PDF doesn't support U+2611 reliably
// We'll simulate the unicode look with text blocks
const UnicodeCheckbox = ({ checked }: { checked: boolean }) => (
  <Text style={{ fontFamily: "Helvetica", fontSize: 10 }}>{checked ? "[X]" : "[ ]"}</Text>
);

export const RepairOrderPDF = ({ repair, qrCodeDataUrl }: { repair: any, qrCodeDataUrl: string }) => {
  const issues = repair.issues?.map((i: any) => i.issueType) || [];
  
  const renderValue = (val: string | null | undefined) => {
    return val && val.trim() !== "" ? val : "—";
  };

  const isChecked = (val: boolean) => val;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER SECTION */}
        <View style={styles.headerSection}>
          <View style={styles.logoBlock}>
            <View style={styles.logoWrapper}>
              <Text style={styles.logoText}>HANDYLAND</Text>
            </View>
            <Text style={styles.logoSub}>AN- UND VERKAUF • REPARATUR • ZUBEHÖR</Text>
          </View>
          
          <View style={styles.ticketBlock}>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Ticket:</Text>
              <Text style={styles.ticketValue}>{repair.ticketNumber}</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Datum:</Text>
              <Text style={styles.ticketValue}>{new Date(repair.createdAt || Date.now()).toLocaleDateString("de-DE")}</Text>
            </View>
            {qrCodeDataUrl && <Image src={qrCodeDataUrl} style={styles.qrCode} />}
          </View>
        </View>

        {/* SECTION 1 — IHRE PERSÖNLICHEN DATEN */}
        <View style={styles.sectionHeader}>
          <Text>IHRE PERSÖNLICHEN DATEN</Text>
        </View>
        
        <View style={styles.fieldRow}>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Vorname, Nachname:</Text>
            <Text style={styles.value}>{renderValue(`${repair.customer?.firstName || ""} ${repair.customer?.lastName || ""}`)}</Text>
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Telefon:</Text>
            <Text style={styles.value}>{renderValue(repair.customer?.phone)}</Text>
          </View>
        </View>
        
        <View style={styles.fieldRow}>
          <View style={styles.colFull}>
            <Text style={styles.labelSmall}>E-Mail:</Text>
            <Text style={styles.valueLarge}>{renderValue(repair.customer?.email)}</Text>
          </View>
        </View>

        {/* SECTION 2 — IHRE GERÄTEDATEN */}
        <View style={styles.sectionHeader}>
          <Text>IHRE GERÄTEDATEN</Text>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Hersteller, Modell:</Text>
            <Text style={styles.value}>{renderValue(`${repair.device?.manufacturer || ""} ${repair.device?.model || ""}`)}</Text>
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.label}>IMEI/SN:</Text>
            <Text style={styles.value}>{renderValue(repair.device?.imei)}</Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Handypasswort:</Text>
            <Text style={styles.value}>{repair.devicePasswordEncrypted || repair.devicePatternEncrypted ? "••••••" : "—"}</Text>
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.label}>SIM-Pin:</Text>
            <Text style={styles.value}>{repair.simPinEncrypted ? "••••••" : "—"}</Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.colHalf}>
            <Text style={styles.label}>SIM Karte:</Text>
            <Text style={styles.value}>
              <UnicodeCheckbox checked={isChecked(repair.hasSimCard)} /> Ja   <UnicodeCheckbox checked={!isChecked(repair.hasSimCard)} /> Nein
            </Text>
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Hülle:</Text>
            <Text style={styles.value}>
              <UnicodeCheckbox checked={isChecked(repair.hasCase)} /> Ja   <UnicodeCheckbox checked={!isChecked(repair.hasCase)} /> Nein
            </Text>
          </View>
        </View>

        {/* SECTION 3 — AUFNAHMEPROTOKOLL */}
        <View style={styles.sectionHeader}>
          <Text>AUFNAHMEPROTOKOLL</Text>
          <Text style={styles.sectionSubtitle}>(Vom Serviceberater ausgefüllt)</Text>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.colFull}>
            <Text style={styles.labelSmall}>Wurde das Gerät bereits repariert?</Text>
            <Text style={styles.valueLarge}>
              <UnicodeCheckbox checked={!isChecked(repair.hadPreviousRepairs)} /> Nein   <UnicodeCheckbox checked={isChecked(repair.hadPreviousRepairs)} /> Ja → {renderValue(repair.previousRepairsDesc)}
            </Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.colFull}>
            <Text style={styles.labelSmall}>Bestehende optische Mängel:</Text>
            <Text style={styles.valueLarge}>{renderValue(repair.conditionNotes)}</Text>
          </View>
        </View>

        <View style={{ ...styles.fieldRow, borderBottomWidth: 0, paddingBottom: 0 }}>
          <Text style={styles.labelSmall}>Defekt, Fehler oder Problem:</Text>
        </View>
        <View style={{ ...styles.fieldRow, paddingTop: 0 }}>
          <View style={styles.colFull}>
            <View style={styles.checkboxGrid}>
              <View style={styles.checkboxItem}><Text><UnicodeCheckbox checked={issues.includes("DISPLAY")} /> Display</Text></View>
              <View style={styles.checkboxItem}><Text><UnicodeCheckbox checked={issues.includes("SPEAKER")} /> Lautsprecher</Text></View>
              <View style={styles.checkboxItem}><Text><UnicodeCheckbox checked={issues.includes("EARPIECE")} /> Ohrmuschel</Text></View>
              <View style={styles.checkboxItem}><Text><UnicodeCheckbox checked={issues.includes("MICROPHONE")} /> Mikrofon</Text></View>
              <View style={styles.checkboxItem}><Text><UnicodeCheckbox checked={issues.includes("BACK_COVER")} /> Back Cover</Text></View>
              <View style={styles.checkboxItem}><Text><UnicodeCheckbox checked={issues.includes("BATTERY")} /> Akku</Text></View>
              <View style={styles.checkboxItem}><Text><UnicodeCheckbox checked={issues.includes("CHARGING_PORT")} /> Ladebuchse</Text></View>
              <View style={styles.checkboxItem}><Text><UnicodeCheckbox checked={issues.includes("WATER_DAMAGE")} /> Wasserschaden</Text></View>
              <View style={{ flexDirection: "row", width: "100%", marginTop: 4 }}>
                <Text><UnicodeCheckbox checked={issues.includes("OTHER")} /> Sonstiges: {renderValue(repair.otherIssuesDesc)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.colFull}>
            <Text style={styles.labelSmall}>Zeitaufwand:</Text>
            <Text style={{ ...styles.valueLarge, fontSize: 9 }}>
              <UnicodeCheckbox checked={repair.repairTimeEstimate === "30 min"} /> 30min  
              <UnicodeCheckbox checked={repair.repairTimeEstimate === "45 min"} /> 45min  
              <UnicodeCheckbox checked={repair.repairTimeEstimate === "1 h"} /> 1h  
              <UnicodeCheckbox checked={repair.repairTimeEstimate === "1,5 h"} /> 1,5h  
              <UnicodeCheckbox checked={repair.repairTimeEstimate === "2 h"} /> 2h  
              <UnicodeCheckbox checked={repair.repairTimeEstimate === "2,5 h"} /> 2,5h  
              <UnicodeCheckbox checked={repair.repairTimeEstimate === "3 h"} /> 3h  
              <UnicodeCheckbox checked={repair.repairTimeEstimate === "4 h"} /> 4h
            </Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Abholtermin:</Text>
            <Text style={styles.value}>{repair.pickupDate ? new Date(repair.pickupDate).toLocaleString("de-DE") : "—"}</Text>
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Preis (inkl. MwSt.):</Text>
            <Text style={styles.value}>{repair.estimatedPrice ? `€ ${repair.estimatedPrice}` : "—"}</Text>
          </View>
        </View>

        {/* SECTION 4 — LEGAL TEXT */}
        <View style={styles.legalText}>
          <Text style={{ marginBottom: 4 }}>Hiermit beauftrage ich den HANDYLAND Service um alle Arbeiten gemäß obigen Informationen am Gerät durchzuführen. Das Gerät hat keine Beschädigungen außer der oben angegebenen. Ich bin mir bewusst, dass gespeicherte Daten, Programme und Lizenzen im Rahmen der Reparatur verloren gehen können und mache den HANDYLAND Service nicht für Datenverlust haftbar. Aller Angaben erfolgen ohne Gewähr. Alle Rechte vorbehalten.</Text>
          <Text style={{ marginBottom: 4 }}>Wir weisen darauf hin, dass trotz größter Sorgfalt, gespeicherte Daten auf Ihrem Gerät verloren gehen können. Sorgen Sie bitte dafür, dass Ihre Daten gesichert sind und Teile kaputt gehen können.</Text>
          <Text style={{ marginBottom: 4 }}>HANDYLAND haftet NICHT für andere Teile im/am Gerät, die durch Tausch/Reparatur kaputt gehen können. Wir haften NUR auf die von uns getauschten und/oder bei uns gekauften Teile. Keine Haftung bei Software- oder Datenproblem.</Text>
          <Text>Wenn das Gerät nicht innerhalb von 10 Werktagen ab dem vorher vereinbarten Abholtermin abgeholt wird, so fällt bei der Abholung eine Aufwandspauschale von 10€ an.</Text>
        </View>

        {/* SECTION 5 — SIGNATURES */}
        <View style={styles.sigSection}>
          <View style={{ ...styles.sigBox, width: "25%", borderTopWidth: 0 }}>
            <Text style={{ ...styles.sigText, textAlign: "left", marginBottom: 2 }}>Datum:</Text>
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>{new Date(repair.createdAt || Date.now()).toLocaleDateString("de-DE")}</Text>
          </View>
          <View style={styles.sigBox}>
            {repair.signatureImage && <Image src={repair.signatureImage} style={styles.sigImage} />}
            <Text style={styles.sigText}>Unterschrift des Kunden</Text>
          </View>
          <View style={styles.sigBox}>
            {repair.adminSignatureImage && <Image src={repair.adminSignatureImage} style={styles.sigImage} />}
            <Text style={styles.sigText}>Unterschrift des Serviceberaters</Text>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          WIR HOFFEN, IHR GERÄT IST BALD WIEDER EINSATZBEREIT! DANKE FÜR IHR VERTRAUEN.{"\n"}
          HANDYLAND — Bahnhofstraße 1 — 12345 Musterstadt — Tel: 01234/56789 — www.handyland.de
        </Text>
        
      </Page>
    </Document>
  );
};
