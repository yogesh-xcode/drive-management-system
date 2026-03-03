import { Skeleton } from "@/components/ui/skeleton";

export default function CardSkeleton() {
  return (
    <div className="bg-card min-h-[148px] space-y-4 rounded-lg border border-border p-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <div className="flex items-center justify-between pt-3">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}
