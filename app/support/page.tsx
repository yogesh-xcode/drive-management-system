import { Suspense } from "react";
import SupportPageInner from "@/app/support/SupportPage";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";

export default function SupportPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SupportPageInner />
    </Suspense>
  );
}
