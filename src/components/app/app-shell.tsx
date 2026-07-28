"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Toaster } from "sonner";
import { logout } from "@/app/(app)/actions";
import { cn, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Campaigns", href: "/campaigns", icon: FolderKanban },
  { label: "Creator CRM", href: "/creators", icon: Users },
  { label: "Payments", href: "/payments", icon: Banknote },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({
  children,
  workspaceName,
  fullName,
  email,
}: {
  children: React.ReactNode;
  workspaceName: string;
  fullName: string;
  email: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside className="flex h-full w-[244px] flex-col border-r border-[#e1e3dc] bg-[#fcfcfa] px-3 py-4">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2.5 px-2.5 py-1">
        <span className="grid size-8 place-items-center rounded-lg bg-[#171a17] text-sm font-bold text-[#c7ff4a]">F</span>
        <span className="font-semibold tracking-[-.035em]">Fluebaze</span>
      </Link>
      <div className="mb-5 rounded-lg border border-[#e1e3dc] bg-white p-2.5">
        <p className="truncate text-xs font-semibold text-[#313631]">{workspaceName}</p>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[.09em] text-[#92988f]">E-commerce creator CRM</p>
      </div>
      <nav className="grid gap-1" aria-label="Application navigation">
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-[#eaf5d7] text-[#456313]"
                  : "text-[#666c64] hover:bg-[#f0f1ec] hover:text-[#2b302b]",
              )}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
              {active ? <ChevronRight className="ml-auto" size={14} /> : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-[#e1e3dc] pt-3">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e3e7de] text-[10px] font-bold text-[#52604d]">
            {initials(fullName || email)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-[#303530]">{fullName || "Fluebaze user"}</span>
            <span className="block truncate text-[10px] text-[#8b9189]">{email}</span>
          </span>
        </div>
        <form action={logout}>
          <Button variant="ghost" size="sm" className="mt-1 w-full justify-start text-[#70766e]">
            <LogOut size={15} /> Log out
          </Button>
        </form>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#171a17]">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      <header className="sticky top-0 z-30 flex h-15 items-center justify-between border-b border-[#e1e3dc] bg-[#f9faf6]/95 px-4 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-[#171a17] text-sm font-bold text-[#c7ff4a]">F</span>
          Fluebaze
        </Link>
        <Button variant="outline" size="icon" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
          <Menu size={19} />
        </Button>
      </header>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[280px] bg-white shadow-xl">
            <button aria-label="Close menu" className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-md hover:bg-[#f0f1eb]" onClick={() => setMobileOpen(false)}>
              <X size={18} />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}
      <main className="min-w-0 lg:pl-[244px]">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</div>
      </main>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
