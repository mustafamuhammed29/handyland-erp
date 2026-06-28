import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getShopSettings } from "../../actions/settings";
import { DEFAULT_RECEIPT_HTML, DEFAULT_RECEIPT_CSS } from "../../(dashboard)/settings/receipt/defaultTemplates";

export const dynamic = "force-dynamic";

export default async function PrintTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [repair, settings] = await Promise.all([
    prisma.repair.findUnique({
      where: { id },
      include: {
        customer: true,
        device: true,
        issues: true,
        conditionItems: true,
      }
    }),
    getShopSettings()
  ]);

  if (!repair) return notFound();

  // Determine which template to use
  const s = settings as any;
  const htmlTemplate = s.receiptTemplateHtml || DEFAULT_RECEIPT_HTML;
  const cssTemplate = s.receiptTemplateCss || DEFAULT_RECEIPT_CSS;

  // Helper to check if an issue exists
  const hasIssue = (type: string) => repair.issues.some(i => i.issueType === type);

  const generatePatternSvg = (patternStr: string | null) => {
    const points = [
      { x: 10, y: 10 }, { x: 30, y: 10 }, { x: 50, y: 10 },
      { x: 10, y: 30 }, { x: 30, y: 30 }, { x: 50, y: 30 },
      { x: 10, y: 50 }, { x: 30, y: 50 }, { x: 50, y: 50 },
    ];
    let pathSvg = "";
    if (patternStr) {
      const indices = patternStr.split(",").map(Number).filter(n => !isNaN(n) && n >= 0 && n <= 8);
      if (indices.length > 0) {
        pathSvg = `<path d="${indices.map((idx, i) => `${i === 0 ? 'M' : 'L'} ${points[idx]?.x} ${points[idx]?.y}`).join(" ")}" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
      }
    }
    const circlesSvg = points.map((p, i) => {
      const isSelected = patternStr ? patternStr.split(",").includes(String(i)) : false;
      return `<circle cx="${p.x}" cy="${p.y}" r="${isSelected ? 3 : 1.5}" fill="${isSelected ? 'black' : '#999'}" />`;
    }).join("");

    return `<svg viewBox="0 0 60 60" width="100%" height="100%" style="display:block;max-width:40px;margin:auto;">${pathSvg}${circlesSvg}</svg>`;
  };

  // Prepare dynamic data
  const data: Record<string, string> = {
    "{{customerName}}": `${repair.customer.firstName} ${repair.customer.lastName}`,
    "{{customerPhone}}": repair.customer.phone || "",
    "{{customerEmail}}": repair.customer.email || "",
    "{{devicePassword}}": repair.devicePasswordEncrypted || "",
    "{{devicePatternSvg}}": generatePatternSvg(repair.devicePatternEncrypted),
    "{{simPin}}": repair.simPinEncrypted || "",
    "{{deviceModel}}": `${repair.device.manufacturer} ${repair.device.model}`,
    "{{hasSimCardYes}}": repair.hasSimCard ? "checked" : "",
    "{{hasSimCardNo}}": !repair.hasSimCard ? "checked" : "",
    "{{hasCaseYes}}": repair.hasCase ? "checked" : "",
    "{{hasCaseNo}}": !repair.hasCase ? "checked" : "",
    "{{hadPreviousRepairsNo}}": !repair.hadPreviousRepairs ? "checked" : "",
    "{{hadPreviousRepairsYes}}": repair.hadPreviousRepairs ? "checked" : "",
    "{{previousRepairsDesc}}": repair.previousRepairsDesc || "",
    "{{conditionNotes}}": [
      ...repair.conditionItems.map(c => c.condition),
      repair.conditionNotes || ""
    ].filter(Boolean).join(" - "),
    "{{issue_DISPLAY}}": hasIssue('DISPLAY') ? "checked" : "",
    "{{issue_BATTERY}}": hasIssue('BATTERY') ? "checked" : "",
    "{{issue_SPEAKER}}": hasIssue('SPEAKER') ? "checked" : "",
    "{{issue_EARPIECE}}": hasIssue('EARPIECE') ? "checked" : "",
    "{{issue_MICROPHONE}}": hasIssue('MICROPHONE') ? "checked" : "",
    "{{issue_BACK_COVER}}": hasIssue('BACK_COVER') ? "checked" : "",
    "{{issue_CHARGING_PORT}}": hasIssue('CHARGING_PORT') ? "checked" : "",
    "{{issue_WATER_DAMAGE}}": hasIssue('WATER_DAMAGE') ? "checked" : "",
    "{{issue_OTHER}}": repair.issues.some(i => !['SPEAKER','EARPIECE','MICROPHONE','DISPLAY','BACK_COVER','BATTERY','CHARGING_PORT','WATER_DAMAGE'].includes(i.issueType)) ? "checked" : "",
    "{{otherIssues}}": [
      ...repair.issues.filter(i => !['SPEAKER','EARPIECE','MICROPHONE','DISPLAY','BACK_COVER','BATTERY','CHARGING_PORT','WATER_DAMAGE'].includes(i.issueType)).map(i => i.issueType),
      repair.problemDescription || ""
    ].filter(Boolean).join(", "),
    "{{repairTimeEstimate}}": repair.repairTimeEstimate || "",
    "{{pickupDate}}": repair.pickupDate ? format(new Date(repair.pickupDate), "dd.MM.yyyy HH:mm") : "",
    "{{estimatedPrice}}": repair.estimatedPrice ? `€ ${repair.estimatedPrice}` : "",
    "{{createdAt}}": format(new Date(repair.createdAt), "dd.MM.yyyy"),
    "{{signatureImage}}": repair.signatureImage 
      ? `<img src="${repair.signatureImage}" alt="Kundenunterschrift" style="height: 100%; object-fit: contain; filter: invert(1);" />` 
      : "",
    "{{adminSignatureImage}}": repair.adminSignatureImage 
      ? `<img src="${repair.adminSignatureImage}" alt="Mitarbeiterunterschrift" style="height: 100%; object-fit: contain; filter: invert(1);" />` 
      : "",
    "{{ticketNumber}}": repair.ticketNumber,
  };

  // Compile template
  let compiledHtml = htmlTemplate;
  Object.keys(data).forEach(key => {
    // using split.join to replace all occurrences without regex escaping issues
    compiledHtml = compiledHtml.split(key).join(data[key]);
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssTemplate }} />
      <div dangerouslySetInnerHTML={{ __html: compiledHtml }} />

      <div className="text-center mt-4 mb-10 no-print font-sans">
        <button 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow font-medium"
        >
          Die Seite wird beim Laden automatisch gedruckt.
        </button>
      </div>

      <script dangerouslySetInnerHTML={{ __html: 'window.onload = function() { window.print(); }' }} />
    </>
  );
}
