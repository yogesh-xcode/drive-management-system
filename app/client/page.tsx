import { Suspense } from "react";
import ClientPageInner from "@/app/client/ClientPage";

export default function ClientPage() {
  return (
    <Suspense fallback={<div>{""}</div>}>
      <ClientPageInner />
    </Suspense>
  );
}
