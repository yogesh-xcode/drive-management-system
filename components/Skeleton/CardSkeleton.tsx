export default function CardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 animate-pulse min-h-[148px] space-y-4">
      <div className="h-4 w-1/3 rounded bg-primary/10" />
      <div className="h-8 w-1/2 rounded bg-primary/10" />
      <div className="flex items-center justify-between pt-3">
        <div className="h-4 w-2/5 rounded bg-primary/10" />
        <div className="h-6 w-16 rounded-full bg-primary/10" />
      </div>
    </div>
  );
}
