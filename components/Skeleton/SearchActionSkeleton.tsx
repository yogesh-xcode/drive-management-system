import { Skeleton } from "@/components/ui/skeleton";

export default function SearchActionSkeleton() {
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-9 w-full max-w-sm rounded-xl" />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-22 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
          <Skeleton className="h-9 w-22 rounded-md" />
        </div>
      </div>
    </div>
  );
}
