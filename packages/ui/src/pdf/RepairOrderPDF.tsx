import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";

// Register custom fonts (Optional, using built-in Helvetica for standard)
// Font.register({ family: 'Inter', src: '...' });

const colors = {
  primary: '#111827', // Tailwind gray-900
  secondary: '#4b5563', // Tailwind gray-600
  accent: '#fbbf24', // Tailwind yellow-400
  border: '#e5e7eb', // Tailwind gray-200
  bgLight: '#f9fafb', // Tailwind gray-50
  white: '#ffffff',
  danger: '#ef4444',
  success: '#22c55e',
};

const styles = StyleSheet.create({
  page: { 
    padding: "40px", 
    fontFamily: "Helvetica", 
    fontSize: 10, 
    color: colors.primary,
    backgroundColor: colors.white
  },
  
  // Header
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 15,
    marginBottom: 20
  },
  brandSection: { width: "60%" },
  logoTitle: { fontSize: 28, fontWeight: "bold", color: colors.primary, letterSpacing: -1 },
  logoSubtitle: { fontSize: 9, color: colors.secondary, marginTop: 4, letterSpacing: 1, textTransform: "uppercase" },
  
  metaSection: { width: "40%", alignItems: "flex-end" },
  ticketBadge: { 
    backgroundColor: colors.bgLight, 
    padding: "6px 12px", 
    borderWidth: 1, 
    borderColor: colors.border,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 8
  },
  ticketLabel: { fontSize: 8, color: colors.secondary, textTransform: "uppercase" },
  ticketNumber: { fontSize: 14, fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  dateText: { fontSize: 9, color: colors.secondary },
  qrCode: { width: 60, height: 60, marginTop: 10 },

  // Sections
  section: { marginBottom: 15 },
  sectionTitle: { 
    fontSize: 11, 
    fontFamily: "Helvetica-Bold", 
    color: colors.primary, 
    backgroundColor: colors.bgLight,
    padding: "6px 8px",
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    marginBottom: 10,
    textTransform: "uppercase"
  },
  
  // Grid / Rows
  row: { flexDirection: "row", marginBottom: 6 },
  colHalf: { width: "50%", paddingRight: 10 },
  colFull: { width: "100%" },
  label: { fontSize: 8, color: colors.secondary, marginBottom: 2, textTransform: "uppercase" },
  valueBox: { 
    borderWidth: 1, 
    borderColor: colors.border, 
    padding: "6px 8px", 
    fontSize: 10, 
    fontFamily: "Helvetica-Bold",
    backgroundColor: colors.white,
    minHeight: 24
  },
  valueText: { fontSize: 10, fontFamily: "Helvetica-Bold" },

  // Checkboxes
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  checkboxBox: { 
    width: 12, 
    height: 12, 
    borderWidth: 1, 
    borderColor: colors.primary, 
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center"
  },
  checkboxCheck: { width: 8, height: 8, backgroundColor: colors.primary },
  checkboxLabel: { fontSize: 9 },

  // Grid for issues
  issuesGrid: { flexDirection: "row", flexWrap: "wrap" },
  issueItem: { width: "33.33%", marginBottom: 6 },

  // Legal
  legalContainer: { 
    marginTop: 10,
    padding: 10, 
    backgroundColor: colors.bgLight, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  legalText: { fontSize: 7, color: colors.secondary, lineHeight: 1.4, textAlign: "justify", marginBottom: 4 },

  // Signatures
  signatureRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  signatureBlock: { width: "45%" },
  signatureLine: { borderBottomWidth: 1, borderBottomColor: colors.primary, height: 40, position: "relative" },
  signatureImage: { position: "absolute", bottom: 2, left: 10, width: 120, height: 40, objectFit: "contain" },
  signatureLabel: { fontSize: 8, color: colors.secondary, marginTop: 4, textAlign: "center" },

  // Footer
  footer: { 
    position: "absolute", 
    bottom: 30, 
    left: 40, 
    right: 40, 
    textAlign: "center", 
    borderTopWidth: 1, 
    borderTopColor: colors.border, 
    paddingTop: 10 
  },
  footerText: { fontSize: 8, color: colors.secondary, marginBottom: 2 },
  footerBold: { fontSize: 8, fontFamily: "Helvetica-Bold", color: colors.primary }
});

const Checkbox = ({ checked, label }: { checked: boolean, label: string }) => (
  <View style={styles.checkboxContainer}>
    <View style={styles.checkboxBox}>
      {checked && <View style={styles.checkboxCheck} />}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </View>
);

export const RepairOrderPDF = ({ 
  repair, 
  qrCodeDataUrl,
  decryptedPassword,
  decryptedPin,
  decryptedPattern
}: { 
  repair: any, 
  qrCodeDataUrl?: string,
  decryptedPassword?: string,
  decryptedPin?: string,
  decryptedPattern?: string
}) => {
  const issues = repair.issues?.map((i: any) => i.issueType) || [];
  const hasIssue = (type: string) => issues.includes(type);
  
  const getOtherIssues = () => {
    return [
      ...(issues.filter((i: string) => !['SPEAKER','EARPIECE','MICROPHONE','DISPLAY','BACK_COVER','BATTERY','CHARGING_PORT','WATER_DAMAGE'].includes(i))),
      repair.problemDescription || ""
    ].filter(Boolean).join(", ");
  };

  const renderValue = (val: string | null | undefined) => val && val.trim() !== "" ? val : "—";
  const formattedDate = new Date(repair.createdAt || Date.now()).toLocaleDateString("de-DE", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandSection}>
            <Text style={styles.logoTitle}>HANDYLAND</Text>
            <Text style={styles.logoSubtitle}>An- und Verkauf • Reparatur • Zubehör</Text>
          </View>
          <View style={styles.metaSection}>
            <View style={styles.ticketBadge}>
              <Text style={styles.ticketLabel}>Ticket Nummer</Text>
              <Text style={styles.ticketNumber}>{repair.ticketNumber}</Text>
            </View>
            <Text style={styles.dateText}>{formattedDate}</Text>
            {qrCodeDataUrl && <Image src={qrCodeDataUrl} style={styles.qrCode} />}
          </View>
        </View>

        {/* SECTION 1: CUSTOMER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Kundendaten</Text>
          <View style={styles.row}>
            <View style={styles.colHalf}>
              <Text style={styles.label}>Name</Text>
              <View style={styles.valueBox}>
                <Text style={styles.valueText}>{renderValue(`${repair.customer?.firstName || ""} ${repair.customer?.lastName || ""}`)}</Text>
              </View>
            </View>
            <View style={styles.colHalf}>
              <Text style={styles.label}>Telefon / E-Mail</Text>
              <View style={styles.valueBox}>
                <Text style={styles.valueText}>{renderValue(`${repair.customer?.phone || ""} ${repair.customer?.email ? `/ ${repair.customer.email}` : ""}`)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 2: DEVICE & SECURITY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Gerätedaten & Sicherheit</Text>
          <View style={styles.row}>
            <View style={styles.colHalf}>
              <Text style={styles.label}>Gerät (Hersteller / Modell)</Text>
              <View style={styles.valueBox}>
                <Text style={styles.valueText}>{renderValue(`${repair.device?.manufacturer || ""} ${repair.device?.model || ""}`)}</Text>
              </View>
            </View>
            <View style={styles.colHalf}>
              <Text style={styles.label}>IMEI / Seriennummer</Text>
              <View style={styles.valueBox}>
                <Text style={styles.valueText}>{renderValue(repair.device?.imei)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.colHalf}>
              <Text style={styles.label}>Geräte-Passwort / Muster</Text>
              <View style={styles.valueBox}>
                <Text style={styles.valueText}>
                  {decryptedPattern ? `Muster: ${decryptedPattern}` : (decryptedPassword || "—")}
                </Text>
              </View>
            </View>
            <View style={styles.colHalf}>
              <Text style={styles.label}>SIM-PIN</Text>
              <View style={styles.valueBox}>
                <Text style={styles.valueText}>{decryptedPin || "—"}</Text>
              </View>
            </View>
          </View>
          <View style={{ ...styles.row, marginTop: 8 }}>
            <View style={styles.colHalf}>
              <Text style={styles.label}>Mitgebrachtes Zubehör</Text>
              <View style={{ flexDirection: "row", gap: 15, marginTop: 4 }}>
                <Checkbox checked={repair.hasSimCard} label="SIM-Karte" />
                <Checkbox checked={repair.hasCase} label="Schutzhülle" />
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 3: REPAIR DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Auftrag & Zustand</Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>Optischer Zustand bei Abgabe (Kratzer, Dellen, Brüche)</Text>
            <View style={{ ...styles.valueBox, minHeight: 36 }}>
              <Text style={{ ...styles.valueText, fontFamily: "Helvetica" }}>
                {repair.conditionItems?.map((c: any) => c.condition).join(", ")}
                {repair.conditionNotes ? ` - ${repair.conditionNotes}` : ""}
                {(!repair.conditionItems || repair.conditionItems.length === 0) && !repair.conditionNotes ? "Keine Mängel festgestellt." : ""}
              </Text>
            </View>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>Defekt / Problem (Auftrag)</Text>
            <View style={styles.issuesGrid}>
              <View style={styles.issueItem}><Checkbox checked={hasIssue("DISPLAY")} label="Display / Glas" /></View>
              <View style={styles.issueItem}><Checkbox checked={hasIssue("BATTERY")} label="Akku" /></View>
              <View style={styles.issueItem}><Checkbox checked={hasIssue("CHARGING_PORT")} label="Ladebuchse" /></View>
              <View style={styles.issueItem}><Checkbox checked={hasIssue("CAMERA")} label="Kamera" /></View>
              <View style={styles.issueItem}><Checkbox checked={hasIssue("SPEAKER")} label="Lautsprecher" /></View>
              <View style={styles.issueItem}><Checkbox checked={hasIssue("MICROPHONE")} label="Mikrofon" /></View>
              <View style={styles.issueItem}><Checkbox checked={hasIssue("BACK_COVER")} label="Rückseite" /></View>
              <View style={styles.issueItem}><Checkbox checked={hasIssue("WATER_DAMAGE")} label="Wasserschaden" /></View>
              <View style={styles.issueItem}><Checkbox checked={hasIssue("SOFTWARE")} label="Software" /></View>
            </View>
            {getOtherIssues() !== "" && (
              <View style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>Sonstiges: <Text style={{ fontFamily: "Helvetica" }}>{getOtherIssues()}</Text></Text>
              </View>
            )}
          </View>
          
          <View style={styles.row}>
            <View style={styles.colHalf}>
              <Text style={styles.label}>Kostenvoranschlag (inkl. MwSt)</Text>
              <View style={styles.valueBox}>
                <Text style={styles.valueText}>{repair.estimatedPrice ? `€ ${Number(repair.estimatedPrice).toFixed(2)}` : "Nach Absprache"}</Text>
              </View>
            </View>
            <View style={styles.colHalf}>
              <Text style={styles.label}>Voraussichtlicher Abholtermin</Text>
              <View style={styles.valueBox}>
                <Text style={styles.valueText}>{repair.pickupDate ? new Date(repair.pickupDate).toLocaleString("de-DE") : "Wird mitgeteilt"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 4: LEGAL */}
        <View style={styles.legalContainer}>
          <Text style={{ ...styles.label, color: colors.primary }}>Allgemeine Geschäftsbedingungen (Auszug)</Text>
          <Text style={styles.legalText}>1. Hiermit beauftrage ich HANDYLAND, alle Arbeiten gemäß obigen Informationen am Gerät durchzuführen. Das Gerät hat keine Beschädigungen außer der oben angegebenen.</Text>
          <Text style={styles.legalText}>2. Ich bin mir bewusst, dass gespeicherte Daten, Programme und Lizenzen im Rahmen der Reparatur verloren gehen können. HANDYLAND haftet NICHT für Datenverlust. Bitte sorgen Sie vor Abgabe für ein Backup.</Text>
          <Text style={styles.legalText}>3. HANDYLAND haftet nicht für Folgeschäden oder Bauteile, die durch die Reparatur (insbesondere bei verklebten Geräten oder Wasserschäden) kaputt gehen können. Wir haften ausschließlich für die von uns getauschten Teile (Gewährleistung).</Text>
          <Text style={styles.legalText}>4. Wird das Gerät nicht innerhalb von 14 Tagen nach Fertigstellung abgeholt, behalten wir uns vor, Lagergebühren in Höhe von 2,00 € pro Tag zu berechnen.</Text>
        </View>

        {/* SECTION 5: SIGNATURES */}
        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}>
              {repair.signatureImage && <Image src={repair.signatureImage} style={styles.signatureImage} />}
            </View>
            <Text style={styles.signatureLabel}>Kundenunterschrift (Auftragserteilung)</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}>
              {repair.adminSignatureImage && <Image src={repair.adminSignatureImage} style={styles.signatureImage} />}
            </View>
            <Text style={styles.signatureLabel}>Mitarbeiter (Annahme)</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerBold}>WIR HOFFEN, IHR GERÄT IST BALD WIEDER EINSATZBEREIT!</Text>
          <Text style={styles.footerText}>HANDYLAND • Bahnhofstraße 1 • 12345 Musterstadt • Tel: 01234/56789</Text>
        </View>

      </Page>
    </Document>
  );
};
