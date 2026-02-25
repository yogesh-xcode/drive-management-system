import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import React from "react";
import { Candidate } from "@/types";

// Improved logic: group by fullName, check if they were ever Applied, and if they progressed
function getConversionRate(candidates: Candidate[]): number {
  // Map of fullName to Set of statuses for that candidate
  const statusMap = new Map<string, Set<string>>();
  candidates.forEach((c) => {
    if (!statusMap.has(c.fullName)) {
      statusMap.set(c.fullName, new Set());
    }
    statusMap.get(c.fullName)!.add(c.status);
  });

  let applicants = 0;
  let progressed = 0;
  statusMap.forEach((statuses) => {
    if (statuses.has("Applied")) {
      applicants += 1;
      if ([...statuses].some((s) => s !== "Applied")) {
        progressed += 1;
      }
    }
  });
  return applicants === 0
    ? 0
    : Number(((progressed / applicants) * 100).toFixed(1));
}

export function StatusConversionCard({ data }: { data: Candidate[] }) {
  const rate = getConversionRate(data);
  const positive = rate >= 50; // Example threshold
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Status Conversion Rate</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {rate}%
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2.5">
        <Badge
          variant="outline"
          className={positive ? "badge-success" : "badge-warning"}
        >
          {positive ? "Good progression" : "Needs improvement"}

          {positive ? (
            <IconTrendingUp className="size-4" />
          ) : (
            <IconTrendingDown className="size-4" />
          )}
        </Badge>
        <span className="text-muted-foreground text-xs ml-1">
          % of candidates who moved past Applied stage
        </span>
      </CardFooter>
    </Card>
  );
}
