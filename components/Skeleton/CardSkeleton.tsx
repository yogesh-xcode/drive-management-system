export default function CardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 animate-pulse shadow flex-1 min-h-[120px] space-y-4">
      <div className="h-6 w-1/2 bg-primary/10 rounded" />
      <div className="h-5 w-1/3 bg-primary/10 rounded" />
      <div className="h-5 w-1/2 bg-primary/10 rounded" />
      <div className="h-5 w-1/2 bg-primary/10 rounded" />
    </div>
  );
}
