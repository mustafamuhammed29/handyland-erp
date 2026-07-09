"use server";

import { prisma, StaffRole } from "@repo/database";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";

export async function createStaff(data: { name: string, email: string, password: string, role: StaffRole }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "OWNER" && session.user.role !== "MANAGER")) {
      throw new Error("Nicht autorisiert.");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const staff = await prisma.staff.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        isActive: true
      }
    });

    revalidatePath("/settings/staff");
    return { success: true, staff };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStaffRole(id: string, role: StaffRole, isActive: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "OWNER") {
      throw new Error("Nur der Inhaber (OWNER) kann Rollen und Status ändern.");
    }

    if (id === session.user.id && !isActive) {
      throw new Error("Sie können sich nicht selbst deaktivieren.");
    }

    await prisma.staff.update({
      where: { id },
      data: { role, isActive }
    });

    revalidatePath("/settings/staff");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetStaffPassword(id: string, newPassword: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "OWNER" && session.user.role !== "MANAGER")) {
      throw new Error("Nicht autorisiert.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.staff.update({
      where: { id },
      data: { password: hashedPassword }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
