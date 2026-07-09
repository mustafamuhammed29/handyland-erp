import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { GlobalSearch } from "../../components/dashboard/GlobalSearch";
import { DashboardSidebar } from "../../components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      
      {/* Sidebar Component (Client) */}
      <DashboardSidebar user={{ name: session.user.name, role: session.user.role }} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b items-center justify-between px-8 shadow-sm">
          <div className="flex-1 max-w-2xl">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-4 ml-4">
            <button aria-label="Benachrichtigungen" className="relative p-2 text-gray-500 hover:text-gray-800 transition-colors">
              <Bell className="h-5 w-5" />
              {/* Fake notification dot */}
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </header>

        {/* Mobile spacing for fixed header from sidebar */}
        <div className="lg:hidden h-16 w-full shrink-0" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
