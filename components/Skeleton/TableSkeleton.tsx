export default function TableSkeleton({ rows = 8, columns = 5 }) {
  return (
    <div className="w-full animate-pulse rounded-lg border bg-card">
      <div className="grid grid-cols-5 gap-3 border-b px-4 py-3">
        {[...Array(columns)].map((_, i) => (
          <div key={i} className="h-4 w-20 rounded bg-primary/10 md:w-28" />
        ))}
      </div>
      {[...Array(rows)].map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="grid grid-cols-5 gap-3 border-b px-4 py-3 last:border-b-0"
        >
          {[...Array(columns)].map((_, colIdx) => (
            <div key={colIdx} className="h-4 w-20 rounded bg-primary/10 md:w-28" />
          ))}
        </div>
      ))}
      <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
        <div className="h-8 w-20 rounded-md bg-primary/10" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-8 rounded-md bg-primary/10" />
        ))}
        <div className="h-8 w-20 rounded-md bg-primary/10" />
      </div>
    </div>
  );
}
