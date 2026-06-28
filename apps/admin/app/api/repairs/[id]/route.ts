import { NextResponse } from "next/server";
import { prisma, IssueType } from "@repo/database";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  try {
    const data = await request.json();

    const repair = await prisma.repair.update({
      where: { id },
      data: {
        conditionNotes: data.visibleDamages,
        pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
        estimatedPrice: data.price ? parseFloat(data.price) : null,
        finalPrice: data.price ? parseFloat(data.price) : null,
        repairTimeEstimate: data.repairTime,
        adminSignatureImage: data.adminSignature,
        status: "ACCEPTED", // Or keep it as is, but it should be ACCEPTED once admin prints it
      },
    });

    // Handle confirmed defects (we clear existing issues and add new ones, or add a specific type)
    // Actually, maybe the customer's issues are the "reported" ones, and the admin confirms them?
    // Let's just update the issues.
    if (data.confirmedDefects && Array.isArray(data.confirmedDefects)) {
      await prisma.repairIssue.deleteMany({
        where: { repairId: id }
      });
      await prisma.repairIssue.createMany({
        data: data.confirmedDefects.map((def: string) => ({
          repairId: id,
          issueType: def as IssueType
        }))
      });
    }

    return NextResponse.json({ success: true, repair });
  } catch (error) {
    console.error("Error updating repair:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  try {
    const repair = await prisma.repair.findUnique({
      where: { id },
      include: {
        customer: true,
        device: true,
        issues: true,
        conditionItems: true,
      }
    });
    return NextResponse.json({ repair });
  } catch (error) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
