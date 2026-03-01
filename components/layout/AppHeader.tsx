"use client";

import { IconBell, IconChevronDown, IconPlus, IconSearch } from "@/lib/icons";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { NavUser } from "@/components/nav-user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notifications = [
  {
    id: 1,
    title: "Drive status updated",
    description: "The Java Backend drive was marked as completed.",
  },
  {
    id: 2,
    title: "New candidate added",
    description: "A candidate was added to the React JS pipeline.",
  },
  {
    id: 3,
    title: "Reminder",
    description: "Staff onboarding review is due this Friday.",
  },
];

type HeaderAction = {
  label: string;
  href: string;
};

const PAGE_META: Record<string, { title: string; action: HeaderAction }> = {
  "/dashboard": {
    title: "Dashboard",
    action: { label: "Create Candidate", href: "/candidate?add=1" },
  },
  "/staff": {
    title: "Staff",
    action: { label: "Add Staff", href: "/staff?add=1" },
  },
  "/client": {
    title: "Client",
    action: { label: "Add Program", href: "/client?add=1" },
  },
  "/candidate": {
    title: "Candidate",
    action: { label: "Create Candidate", href: "/candidate?add=1" },
  },
  "/drive": {
    title: "Drive",
    action: { label: "Add Drive", href: "/drive?add=1" },
  },
  "/reports": {
    title: "Reports",
    action: { label: "Open Reports", href: "/reports" },
  },
};

const ACTION_OPTIONS: HeaderAction[] = [
  { label: "Create Candidate", href: "/candidate?add=1" },
  { label: "Add Staff", href: "/staff?add=1" },
  { label: "Add Program", href: "/client?add=1" },
  { label: "Add Drive", href: "/drive?add=1" },
];

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = `/${pathname.split("/").filter(Boolean)[0] || "dashboard"}`;
  const currentMeta = useMemo(
    () =>
      PAGE_META[basePath] ?? {
        title: "Dashboard",
        action: { label: "Create Candidate", href: "/candidate?add=1" },
      },
    [basePath],
  );
  const [selectedAction, setSelectedAction] = useState<HeaderAction>(
    currentMeta.action,
  );

  useEffect(() => {
    setSelectedAction(currentMeta.action);
  }, [currentMeta]);

  return (
    <>
      {pathname === "/" ? null : (
        <header className="h-14 border-b bg-background px-4 md:px-6">
          <div className="grid h-full grid-cols-[auto_1fr_auto] items-center gap-3">
            <div className="min-w-[140px]">
              <h1 className="truncate text-lg font-semibold">{currentMeta.title}</h1>
            </div>

            <label className="relative mx-auto w-full max-w-md">
              <IconSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${currentMeta.title.toLowerCase()} or type a command`}
                className="border-input bg-background h-9 w-full rounded-md border pr-14 pl-8 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
              <kbd className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold">
                ⌘ F
              </kbd>
            </label>
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center">
                <Button
                  className="h-9 rounded-r-none rounded-l-md border-r border-primary-foreground/20 px-3 text-xs font-semibold"
                  onClick={() => router.push(selectedAction.href)}
                >
                  <IconPlus className="size-4" />
                  {selectedAction.label}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="h-9 rounded-l-none rounded-r-md px-2"
                      aria-label="Open quick actions"
                    >
                      <IconChevronDown className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={6}>
                    {ACTION_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.label}
                        onSelect={() => {
                          setSelectedAction(option);
                        }}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="hover:bg-muted relative inline-flex size-9 items-center justify-center rounded-md transition-colors"
                    aria-label="Open notifications"
                  >
                    <span className="bg-primary absolute top-1.5 right-1.5 size-1.5 rounded-full" />
                    <IconBell className="size-4 text-muted-foreground" />
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-card/95 top-16 right-4 left-auto w-[calc(100%-2rem)] translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-xl border-border p-0 shadow-xl backdrop-blur-sm sm:max-w-md md:right-6">
                  <DialogHeader className="border-b border-border px-4 py-3">
                    <DialogTitle className="text-base">Notifications</DialogTitle>
                    <DialogDescription className="text-xs">
                      Recent updates from your workspace.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[360px] space-y-1 overflow-y-auto p-2">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className="hover:bg-accent/60 group relative rounded-lg border border-border bg-background/60 px-3 py-2.5 transition-colors"
                      >
                        <span className="bg-primary/70 absolute top-3 left-1 h-2.5 w-0.5 rounded-full opacity-70 group-hover:opacity-100" />
                        <p className="pl-2 text-sm font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="text-muted-foreground mt-1 pl-2 text-xs leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <NavUser />
            </div>
          </div>
        </header>
      )}
    </>
  );
}
