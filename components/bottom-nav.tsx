"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, ScanLine, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/checkin", label: "Check-in", icon: ScanLine, highlight: true },
  { href: "/eventos", label: "Eventos", icon: Calendar },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-1">
        {items.map(({ href, label, icon: Icon, highlight }) => {
          const active = pathname === href;
          if (highlight) {
            return (
              <Link
                key={href}
                href={href}
                className="-mt-6 flex flex-col items-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5C518] shadow-lg">
                  <Icon className="h-6 w-6 text-black" />
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-xs",
                active ? "text-neutral-900 font-medium" : "text-neutral-400"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
