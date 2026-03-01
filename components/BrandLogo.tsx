import { cn } from "@/lib/utils";
import { IconActivity } from "@/lib/icons";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div className="flex size-8 items-center justify-center rounded-full border border-border bg-background text-primary">
        <IconActivity className="size-4" />
      </div>
      {compact ? (
        <span className="text-base font-semibold group-data-[collapsible=icon]:hidden">
          Drivems Suite
        </span>
      ) : (
        <div className="group-data-[collapsible=icon]:hidden">
          <p className="text-sm font-extrabold tracking-[0.1em] text-foreground">
            DRIVEMS SUITE
          </p>
          <p className="text-xs text-muted-foreground">Recruitment Operations</p>
        </div>
      )}
    </div>
  );
}
