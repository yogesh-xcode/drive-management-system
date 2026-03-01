import { Suspense } from "react";
import DrivePageInner from "@/app/drive/DrivePage";

export default function ClientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DrivePageInner />
    </Suspense>
  );
}
