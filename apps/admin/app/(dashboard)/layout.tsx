"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  Package, 
  BarChart, 
  Settings,
  Bell,
  Menu,
  X
} from "lucide-react";
import { GlobalSearch } from "../../components/dashboard/GlobalSearch";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Repairs", href: "/repairs", icon: Wrench },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Settings", href: "/settings/receipt", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar — Dark branded */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111827] text-white flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Wrench className="w-4 h-4 text-[#111827]" />
            </div>
            <span className="text-lg font-bold tracking-wider uppercase bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              HANDYLAND
            </span>
          </div>
          <button aria-label="Menü schließen" onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-yellow-500/15 text-yellow-400 font-medium border-l-2 border-yellow-400 ml-0" 
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-yellow-400' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-[#111827] font-bold text-sm">
                AD
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Admin</span>
                <span className="text-xs text-gray-500">Owner</span>
              </div>
            </div>
            <button
              onClick={() => {
                import("next-auth/react").then(({ signOut }) => signOut({ callbackUrl: "/login" }));
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button aria-label="Menü öffnen" onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-800">
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="hidden sm:block">
              <GlobalSearch />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button aria-label="Benachrichtigungen" className="relative p-2 text-gray-500 hover:text-gray-800 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
