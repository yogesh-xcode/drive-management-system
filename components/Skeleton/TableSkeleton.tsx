export default function TableSkeleton({ rows = 8, columns = 5 }) {
  return (
    <div className="w-full animate-pulse">
      {/* Table header */}
      <div className="bg-card rounded-t-lg p-3 flex gap-3 justify-around">
        {[...Array(columns)].map((_, i) => (
          <div key={i} className="h-4 w-24 bg-primary/10 rounded text-center" />
        ))}
      </div>
      {/* Table rows */}
      {[...Array(rows)].map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="bg-background border-t px-3 py-3 flex gap-3 items-center justify-around"
        >
          {[...Array(columns)].map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-4 w-24 bg-primary/10 rounded text-center"
            />
          ))}
        </div>
      ))}
      {/* Pagination skeleton */}
      <div className="flex justify-center items-center gap-2 py-4">
        <div className="h-8 w-20 bg-primary/10 rounded-md animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-8 bg-primary/10 rounded-md" />
        ))}
        <div className="h-8 w-20 bg-primary/10 rounded-md animate-pulse" />
      </div>
    </div>
  );
}
