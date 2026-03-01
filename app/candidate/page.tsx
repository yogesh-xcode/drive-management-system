import { Suspense } from "react";
import CandidatePageInner from "@/app/candidate/CandidatePage";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";

export default function ClientPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CandidatePageInner />
    </Suspense>
  );
}
