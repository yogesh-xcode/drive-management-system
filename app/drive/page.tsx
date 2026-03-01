import { Suspense } from "react";
import DrivePageInner from "@/app/drive/DrivePage";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";

export default function ClientPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DrivePageInner />
    </Suspense>
  );
}
