"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "../ui/cn";

export function NavLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "[&_svg]:size-4.5 [&_svg]:shrink-0",
        active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
