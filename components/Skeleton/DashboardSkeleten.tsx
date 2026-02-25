// components/SkeletonCard.js
export function DashboardSkeleten() {
  return (
    <div className="animate-pulse bg-card rounded-lg h-[180px] flex flex-col justify-between p-4 shadow-xs">
      <div className="h-6 bg-primary/10 rounded w-1/2 mb-2"></div>
      <div className="h-6 bg-primary/10 rounded w-full mb-2"></div>
      <div className="h-6 bg-primary/10 rounded w-2/3"></div>
    </div>
  );
}
