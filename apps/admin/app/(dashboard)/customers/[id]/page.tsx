import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import { CustomerHeader } from "../../../../components/customers/customer-header";
import { RepairHistory } from "../../../../components/customers/repair-history";
import { DeviceList } from "../../../../components/customers/device-list";
import { CustomerNotes } from "../../../../components/customers/customer-notes";
import { SpendingChart } from "../../../../components/customers/spending-chart";
import { CustomerStats } from "../../../../components/customers/customer-stats";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      repairs: {
        include: {
          device: true,
          issues: true,
        },
        orderBy: { createdAt: "desc" },
      },
      // Note: customer doesn't directly relate to devices in schema, devices relate to repairs.
      // But let's check schema. Customer DOES NOT have a devices[] relation in handyland schema, 
      // instead devices are part of repairs or we fetch distinct devices through repairs.
      // We will handle device extraction below.
      notes: {
        include: {
          staff: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) notFound();

  // Extract unique devices from repairs
  const uniqueDevicesMap = new Map();
  customer.repairs.forEach((repair: any) => {
    if (repair.device && !uniqueDevicesMap.has(repair.device.imei || repair.device.id)) {
      uniqueDevicesMap.set(repair.device.imei || repair.device.id, repair.device);
    }
  });
  const devices = Array.from(uniqueDevicesMap.values());

  // Calculate monthly spending for chart (last 12 months)
  // We use Prisma queryRaw for PostgreSQL date truncation
  let monthlySpending: any[] = [];
  try {
    monthlySpending = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM("finalPrice") as total
      FROM "Repair"
      WHERE "customerId" = ${params.id}
        AND "finalPrice" IS NOT NULL
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `;
  } catch (err) {
    // Fallback if not postgres
    console.error("Query raw failed, using fallback", err);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/customers" className="p-2 bg-white rounded-lg border shadow-sm hover:bg-gray-50 transition text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Kundenprofil</h1>
      </div>

      <CustomerHeader customer={customer} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-6">
          <SpendingChart data={monthlySpending} />
          <RepairHistory repairs={customer.repairs} />
          <DeviceList devices={devices} />
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <CustomerStats customer={customer} />
          <CustomerNotes customerId={customer.id} notes={customer.notes} />
        </div>
      </div>
    </div>
  );
}
