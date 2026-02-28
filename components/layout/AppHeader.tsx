"use client";

import { IconBell } from "@tabler/icons-react";
import { usePathname } from "next/navigation";

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

export function AppHeader() {
  const pathname = usePathname();
  const pageTitle =
    pathname === "/dashboard"
      ? "Dashboard"
      : (pathname.split("/").filter(Boolean).at(-1)?.replace("-", " ") ??
        "Dashboard");

  return (
    <>
      {pathname === "/" ? null : (
        <header className="border-b bg-background/95">
          <div className="flex h-14 items-center justify-between gap-2 px-4 md:px-6">
            <h1 className="truncate text-lg font-semibold capitalize md:text-xl">
              {pageTitle}
            </h1>
            <div className="flex items-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open notifications"
                  >
                    <IconBell className="size-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="top-16 right-4 left-auto w-[calc(100%-2rem)] translate-x-0 translate-y-0 sm:max-w-md md:right-6">
                  <DialogHeader>
                    <DialogTitle>Notifications</DialogTitle>
                    <DialogDescription>
                      Recent updates from your workspace.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    {notifications.map((item) => (
                      <div key={item.id} className="rounded-md border p-3">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-muted-foreground mt-1 text-xs">
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
