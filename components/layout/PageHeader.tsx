import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20  bg-background/90 backdrop-blur",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div
          className={cn(
            "flex min-w-0 items-center gap-3 ml-6 fixed left-8 top-2.5",
          )}
        >
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold md:text-xl">
              {title}
            </h1>
            {/* {description ? (
              <p className="truncate text-xs text-muted-foreground md:text-sm">
                {description}
              </p>
            ) : null} */}
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </header>
  );
}

type PageSectionProps = {
  children: ReactNode;
  className?: string;
};

export function PageSection({ children, className }: PageSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
