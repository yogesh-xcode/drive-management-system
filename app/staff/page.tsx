import { Suspense } from "react";
import StaffPageInner from "@/app/staff/StaffPage";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";

export default function ClientPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StaffPageInner />
    </Suspense>
  );
}
