import { Suspense } from "react";
import AccountPageInner from "@/app/account/AccountPage";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";

export default function AccountPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AccountPageInner />
    </Suspense>
  );
}
