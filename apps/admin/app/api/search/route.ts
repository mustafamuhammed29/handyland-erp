import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ repairs: [], customers: [] });
  }

  try {
    const [repairs, customers] = await Promise.all([
      prisma.repair.findMany({
        where: {
          OR: [
            { ticketNumber: { contains: q, mode: "insensitive" } },
            { customer: { firstName: { contains: q, mode: "insensitive" } } },
            { customer: { lastName: { contains: q, mode: "insensitive" } } },
            { customer: { phone: { contains: q } } },
          ]
        },
        select: {
          id: true,
          ticketNumber: true,
          status: true,
          device: {
            select: { manufacturer: true, model: true }
          }
        },
        take: 5,
        orderBy: { createdAt: "desc" }
      }),
      prisma.customer.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true
        },
        take: 5,
        orderBy: { createdAt: "desc" }
      })
    ]);

    return NextResponse.json({ repairs, customers });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed", details: error.message, stack: error.stack }, { status: 500 });
  }
}
