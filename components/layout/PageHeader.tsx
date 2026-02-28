import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

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
