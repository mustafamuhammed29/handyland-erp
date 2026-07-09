import { prisma } from "@repo/database";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { StaffManagerClient } from "../../../../components/staff/StaffManagerClient";

export const dynamic = "force-dynamic";

export default async function StaffManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== "OWNER" && session.user.role !== "MANAGER")) {
    redirect("/dashboard");
  }

  const staffList = await prisma.staff.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastActiveAt: true
    }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Mitarbeiterverwaltung</h1>
          <p className="text-muted-foreground">Teammitglieder verwalten, Rollen zuweisen und Zugänge steuern.</p>
        </div>
      </div>

      <StaffManagerClient 
        initialStaff={staffList} 
        currentUser={{ id: session.user.id, role: session.user.role }} 
      />
    </div>
  );
}
