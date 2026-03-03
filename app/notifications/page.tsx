import { Suspense } from "react";
import NotificationsPageInner from "@/app/notifications/NotificationsPage";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";

export default function NotificationsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NotificationsPageInner />
    </Suspense>
  );
}
