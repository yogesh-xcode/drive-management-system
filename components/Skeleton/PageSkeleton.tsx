import CardSkeleton from "@/components/Skeleton/CardSkeleton";
import SearchActionSkeleton from "@/components/Skeleton/SearchActionSkeleton";
import TableSkeleton from "@/components/Skeleton/TableSkeleton";
import { PageSection } from "@/components/layout/PageHeader";

export default function PageSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <PageSection>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <SearchActionSkeleton />
        <TableSkeleton />
      </PageSection>
    </div>
  );
}
