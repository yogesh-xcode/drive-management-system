import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleten() {
  return (
    <div className="bg-card flex h-[180px] flex-col justify-between rounded-lg border border-border p-4 shadow-xs">
      <Skeleton className="mb-2 h-6 w-1/2" />
      <Skeleton className="mb-2 h-6 w-full" />
      <Skeleton className="h-6 w-2/3" />
    </div>
  );
}
