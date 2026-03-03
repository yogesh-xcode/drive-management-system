"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageSection } from "@/components/layout/PageHeader";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";
import { userService } from "@/lib/repositories";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: "Drive status updated",
    description: "The Java Backend drive was marked as completed.",
    read: false,
    createdAt: "Today, 9:18 AM",
  },
  {
    id: 2,
    title: "New candidate added",
    description: "A candidate was added to the React JS pipeline.",
    read: false,
    createdAt: "Today, 8:04 AM",
  },
  {
    id: 3,
    title: "Reminder",
    description: "Staff onboarding review is due this Friday.",
    read: true,
    createdAt: "Yesterday, 5:32 PM",
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const user = await userService.get();
      if (!mounted) return;

      if (!user) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    void init();
    return () => {
      mounted = false;
    };
  }, [router]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const markOneAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col">
        <PageSection>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Inbox</CardTitle>
                <CardDescription>
                  {unreadCount > 0
                    ? `${unreadCount} unread notifications`
                    : "All caught up"}
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markOneAsRead(item.id)}
                  className={cn(
                    "flex w-full flex-col gap-1 rounded-md border px-3 py-3 text-left transition-colors",
                    item.read
                      ? "border-border bg-background"
                      : "border-primary/25 bg-primary/5",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <span className="text-muted-foreground text-xs">
                      {item.createdAt}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>
        </PageSection>
      </div>
    </div>
  );
}
