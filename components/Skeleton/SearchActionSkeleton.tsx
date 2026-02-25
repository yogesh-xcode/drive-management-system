export default function SearchActionSkeleton() {
  return (
    <div className="flex items-center w-full">
      <div className="h-8 flex-1 mr-8 bg-primary/10 rounded-md animate-pulse"></div>
      <div className="flex gap-4">
        <div className="h-8 w-20 bg-primary/10 rounded-md animate-pulse" />
        <div className="h-8 w-20 bg-primary/10 rounded-md animate-pulse" />
      </div>
    </div>
  );
}
