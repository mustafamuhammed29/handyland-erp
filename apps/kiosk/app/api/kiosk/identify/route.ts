import { NextResponse } from "next/server";
import { prisma, normalizePhone } from "@repo/database";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPhone = searchParams.get("phone");

  if (!rawPhone) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const phone = normalizePhone(rawPhone);

  try {
    const customer = await prisma.customer.findUnique({
      where: { phone },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        loyaltyTier: true,
        _count: {
          select: { repairs: true }
        }
      },
    });

    if (!customer) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      customer: {
        ...customer,
        totalRepairs: customer._count.repairs,
      },
    });
  } catch (error) {
    console.error("Error looking up customer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
