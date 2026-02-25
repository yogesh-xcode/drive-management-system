import { Suspense } from "react";
import CandidatePageInner from "@/app/candidate/CandidatePage";

export default function ClientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CandidatePageInner />
    </Suspense>
  );
}
