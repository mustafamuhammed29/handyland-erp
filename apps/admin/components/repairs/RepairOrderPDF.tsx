import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import QRCode from "qrcode";

// Register custom fonts (optional, using default Helvetica for simplicity/reliability in PDFs)
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#111" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  logoText: { fontSize: 24, fontWeight: "bold", color: "#000" },
  ticketBox: { backgroundColor: "#eee", padding: 8, borderRadius: 4, alignItems: "center" },
  ticketText: { fontSize: 16, fontWeight: "bold" },
  qrCode: { width: 60, height: 60, marginTop: 4 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", backgroundColor: "#333", color: "#fff", padding: 4, marginTop: 15, marginBottom: 10, textTransform: "uppercase" },
  row: { flexDirection: "row", marginBottom: 6 },
  colHalf: { width: "50%", paddingRight: 10 },
  label: { fontSize: 8, color: "#555", textTransform: "uppercase", marginBottom: 2 },
  value: { fontSize: 10, fontWeight: "bold", borderBottomWidth: 1, borderBottomColor: "#ccc", paddingBottom: 2 },
  checkboxRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4, gap: 10 },
  checkboxItem: { flexDirection: "row", alignItems: "center", width: "30%", marginBottom: 4 },
  checkboxBox: { width: 10, height: 10, borderWidth: 1, borderColor: "#000", marginRight: 4, justifyContent: "center", alignItems: "center" },
  checkboxChecked: { width: 6, height: 6, backgroundColor: "#000" },
  signatureSection: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  signatureBox: { width: "45%", borderTopWidth: 1, borderTopColor: "#000", paddingTop: 5, alignItems: "center" },
  signatureImage: { width: 120, height: 60, marginTop: -65 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#777", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10 },
});

export const RepairOrderPDF = ({ repair, qrCodeDataUrl }: { repair: any, qrCodeDataUrl: string }) => {
  const issues = repair.issues.map((i: any) => i.issueType);
  const conditionItems = repair.conditionItems.map((c: any) => c.condition);
  
  const Checkbox = ({ label, checked }: { label: string, checked: boolean }) => (
    <View style={styles.checkboxItem}>
      <View style={styles.checkboxBox}>{checked && <View style={styles.checkboxChecked} />}</View>
      <Text style={{ fontSize: 9 }}>{label}</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.logoText}>HANDYLAND</Text>
            <Text style={{ marginTop: 4, color: "#555" }}>Reparaturauftrag</Text>
            <Text style={{ marginTop: 2, color: "#555" }}>Datum: {new Date().toLocaleDateString("de-DE")}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={styles.ticketBox}>
              <Text style={{ fontSize: 8, color: "#555", marginBottom: 2 }}>TICKET NUMMER</Text>
              <Text style={styles.ticketText}>{repair.ticketNumber}</Text>
            </View>
            {qrCodeDataUrl && <Image src={qrCodeDataUrl} style={styles.qrCode} />}
          </View>
        </View>

        {/* CUSTOMER SECTION */}
        <Text style={styles.sectionTitle}>IHRE PERSÖNLICHEN DATEN</Text>
        <View style={styles.row}>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{repair.customer.firstName} {repair.customer.lastName}</Text>
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Telefon</Text>
            <Text style={styles.value}>{repair.customer.phone}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.colHalf}>
            <Text style={styles.label}>E-Mail</Text>
            <Text style={styles.value}>{repair.customer.email || "-"}</Text>
          </View>
        </View>

        {/* DEVICE SECTION */}
        <Text style={styles.sectionTitle}>IHRE GERÄTEDATEN</Text>
        <View style={styles.row}>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Gerät (Hersteller / Modell)</Text>
            <Text style={styles.value}>{repair.device.manufacturer} {repair.device.model}</Text>
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.label}>IMEI / Seriennummer</Text>
            <Text style={styles.value}>{repair.device.imei || "-"}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Handypasswort</Text>
            <Text style={styles.value}>{repair.devicePasswordEncrypted || "Keins"}</Text>
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.label}>SIM-PIN</Text>
            <Text style={styles.value}>{repair.simPinEncrypted || "Keins"}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Zubehör abgegeben</Text>
            <Text style={styles.value}>
              SIM: {repair.hasSimCard ? "Ja" : "Nein"} | Hülle: {repair.hasCase ? "Ja" : "Nein"}
            </Text>
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Schon mal repariert?</Text>
            <Text style={styles.value}>{repair.hadPreviousRepairs ? "Ja" : "Nein"}</Text>
          </View>
        </View>

        {/* ADMIN SECTION */}
        <Text style={styles.sectionTitle}>AUFNAHMEPROTOKOLL (Vom Mitarbeiter auszufüllen)</Text>
        
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>Bestehende optische Mängel</Text>
          <Text style={styles.value}>{repair.conditionNotes || "Keine"}</Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>Defekt, Fehler oder Problem</Text>
          <View style={styles.checkboxRow}>
            <Checkbox label="Display" checked={issues.includes("DISPLAY")} />
            <Checkbox label="Akku" checked={issues.includes("BATTERY")} />
            <Checkbox label="Ladebuchse" checked={issues.includes("CHARGING_PORT")} />
            <Checkbox label="Lautsprecher" checked={issues.includes("SPEAKER")} />
            <Checkbox label="Ohrmuschel" checked={issues.includes("EARPIECE")} />
            <Checkbox label="Mikrofon" checked={issues.includes("MICROPHONE")} />
            <Checkbox label="Kamera" checked={issues.includes("CAMERA")} />
            <Checkbox label="Wasserschaden" checked={issues.includes("WATER_DAMAGE")} />
            <Checkbox label="Back Cover" checked={issues.includes("BACK_COVER")} />
            <Checkbox label="Software" checked={issues.includes("SOFTWARE")} />
            <Checkbox label="Sonstiges" checked={issues.includes("OTHER")} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Zeitaufwand für Ihre Reparatur</Text>
            <Text style={styles.value}>{repair.repairTimeEstimate || "-"}</Text>
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Abholtermin</Text>
            <Text style={styles.value}>
              {repair.pickupDate ? new Date(repair.pickupDate).toLocaleString("de-DE") : "Noch nicht vereinbart"}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.colHalf}>
            <Text style={styles.label}>Preis (inklusive MwSt)</Text>
            <Text style={styles.value}>{repair.estimatedPrice ? `€ ${repair.estimatedPrice}` : "Nach Absprache"}</Text>
          </View>
        </View>

        {/* SIGNATURES */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            {repair.signatureImage && (
              <Image src={repair.signatureImage} style={styles.signatureImage} />
            )}
            <Text style={{ fontSize: 9 }}>Unterschrift des Kunden</Text>
          </View>
          <View style={styles.signatureBox}>
            {repair.adminSignatureImage && (
              <Image src={repair.adminSignatureImage} style={styles.signatureImage} />
            )}
            <Text style={{ fontSize: 9 }}>Unterschrift des Serviceberaters</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          HANDYLAND | Es gelten unsere Allgemeinen Geschäftsbedingungen. | www.handyland.de
        </Text>
      </Page>
    </Document>
  );
};
