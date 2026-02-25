import { Suspense } from "react";
import ClientPageInner from "@/app/client/ClientPage";

export default function ClientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientPageInner />
    </Suspense>
  );
}
