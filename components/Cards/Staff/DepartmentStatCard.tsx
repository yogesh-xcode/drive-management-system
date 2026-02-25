import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Staff } from "@/types";
import React from "react";

interface DepartmentStatCardProps {
  data: Staff[];
}

const DepartmentStatCard: React.FC<DepartmentStatCardProps> = ({ data }) => {
  // Count and find max
  const counts: Record<string, number> = {};
  data.forEach(({ department }) => {
    counts[department] = (counts[department] || 0) + 1;
  });
  const sorted = Object.entries(counts)
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count);

  // Fallback if no data
  if (!sorted.length) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Largest Department</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            --
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex gap-2 items-center">
          <span className="badge-pill badge-neutral">
            No department
          </span>
          <span className="text-muted-foreground text-xs ml-2">
            Staff in this department
          </span>
        </CardFooter>
      </Card>
    );
  }

  const largest = sorted[0];

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Largest Department</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[200px]/card:text-3xl">
          {largest.count}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex gap-2 items-center">
        <span className="badge-pill badge-info">
          {largest.department}
        </span>
        <span className="text-muted-foreground text-xs ml-2">
          Staff in this department
        </span>
      </CardFooter>
    </Card>
  );
};

export default DepartmentStatCard;
