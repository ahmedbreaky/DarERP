"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "../ui/cn";

/**
 * Page frame: sidebar on the start side (right in Arabic, left in English),
 * top bar, and content. On phones the sidebar slides in from a menu button.
 */
export function AppShell({
  sidebar,
  topbar,
  children,
  labels,
}: {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  labels: { open: string; close: string };
}) {
  const pathname = usePathname();
  // Remember which page the mobile menu was opened on, so navigating closes it.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn !== null && openedOn === pathname;
  const setOpen = (value: boolean) => setOpenedOn(value ? pathname : null);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      {open ? (
        <button
          type="button"
          aria-label={labels.close}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 w-64 border-e border-border bg-surface transition-transform",
          "lg:sticky lg:top-0 lg:h-dvh",
          !open && "max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full",
        )}
      >
        <button
          type="button"
          aria-label={labels.close}
          onClick={() => setOpen(false)}
          className="absolute end-3 top-4 rounded-md p-1.5 text-muted hover:bg-surface-2 lg:hidden"
        >
          <X className="size-5" aria-hidden />
        </button>
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-surface/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label={labels.open}
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="-ms-1.5 rounded-md p-1.5 text-muted hover:bg-surface-2 lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <div className="flex flex-1 items-center justify-end gap-2">{topbar}</div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
