import { prisma, decrypt } from "@repo/database";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrintViewerClient } from "../../../components/repairs/PrintViewerClient";

export const dynamic = "force-dynamic";

export default async function PrintTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const repair = await prisma.repair.findUnique({
    where: { id },
    include: {
      customer: true,
      device: true,
      issues: true,
      conditionItems: true,
    }
  });

  if (!repair) return notFound();

  // Decrypt security fields securely on the server
  const decryptedPassword = decrypt(repair.devicePasswordEncrypted);
  const decryptedPin = decrypt(repair.simPinEncrypted);
  const decryptedPattern = decrypt(repair.devicePatternEncrypted);

  const qrCodeUrl = `https://handyland.com/track/${repair.ticketNumber}`;

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shrink-0">
        <Link href={`/repairs/${id}`} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition">
          <ArrowLeft className="w-4 h-4" /> Zurück zum Ticket
        </Link>
        <div className="font-bold">Ticket: {repair.ticketNumber}</div>
      </div>
      
      <div className="flex-1 w-full p-4 md:p-8">
        <PrintViewerClient 
          repairData={repair}
          qrCodeUrl={qrCodeUrl}
          decryptedPassword={decryptedPassword}
          decryptedPin={decryptedPin}
          decryptedPattern={decryptedPattern}
        />
      </div>
    </div>
  );
}
