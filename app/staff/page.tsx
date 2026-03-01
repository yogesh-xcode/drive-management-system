import { Suspense } from "react";
import StaffPageInner from "@/app/staff/StaffPage";

export default function ClientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StaffPageInner />
    </Suspense>
  );
}
