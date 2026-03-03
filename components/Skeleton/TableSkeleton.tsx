import { Skeleton } from "@/components/ui/skeleton";

export default function TableSkeleton({ rows = 8 }) {
  return (
    <div className="bg-card w-full rounded-2xl border border-border">
      <div className="grid grid-cols-[36px_1fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-border px-4 py-3">
        <Skeleton className="h-5 w-5 rounded-sm" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      {[...Array(rows)].map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="grid grid-cols-[36px_1fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-border px-4 py-3 last:border-b-0"
        >
          <Skeleton className="h-5 w-5 rounded-sm" />
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      ))}
      <div className="flex items-center justify-center gap-2 border-t border-border px-4 py-3">
        <Skeleton className="h-9 w-24 rounded-md" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-9 rounded-md" />
        ))}
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}
