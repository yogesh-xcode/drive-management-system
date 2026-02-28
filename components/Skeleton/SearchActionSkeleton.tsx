export default function SearchActionSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="h-10 w-full rounded-md bg-primary/10 md:flex-1" />
        <div className="flex gap-3 md:ml-4">
          <div className="h-10 w-24 rounded-md bg-primary/10" />
          <div className="h-10 w-24 rounded-md bg-primary/10" />
        </div>
      </div>
    </div>
  );
}
