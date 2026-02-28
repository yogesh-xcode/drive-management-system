import CardSkeleton from "@/components/Skeleton/CardSkeleton";
import SearchActionSkeleton from "@/components/Skeleton/SearchActionSkeleton";
import TableSkeleton from "@/components/Skeleton/TableSkeleton";

export default function PageSkeleton() {
  return (
    <div className="flex flex-1 flex-col px-4 py-5 md:px-8 md:py-6">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <SearchActionSkeleton />
        <TableSkeleton />
      </div>
    </div>
  );
}
