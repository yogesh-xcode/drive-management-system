import { Suspense } from "react";
import ClientPageInner from "@/app/client/ClientPage";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";

export default function ClientPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ClientPageInner />
    </Suspense>
  );
}
