import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Staff } from "@/types";
import React from "react";

interface TenureStatCardProps {
  data: Staff[];
}

const TenureStatCard: React.FC<TenureStatCardProps> = ({ data }) => {
  const now = new Date("2025-08-20");
  let sum = 0;
  data.forEach(({ joinedDate }) => {
    const years =
      (now.getTime() - new Date(joinedDate).getTime()) /
      (365.25 * 24 * 3600 * 1000);
    sum += years;
  });
  const avg = data.length ? sum / data.length : 0;

  let badge = "Good retention",
    badgeClass = "badge-pill badge-success";
  if (avg < 2) {
    badge = "Very New Team";
    badgeClass = "badge-pill badge-warning";
  } else if (avg < 5) {
    badge = "Growing Experience";
    badgeClass = "badge-pill badge-info";
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Staff Experience</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {avg.toFixed(1)} years
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex gap-2 items-center">
        <span className={badgeClass}>
          {badge}
        </span>
        <span className="text-muted-foreground text-xs ml-2">
          Average tenure in organization
        </span>
      </CardFooter>
    </Card>
  );
};

export default TenureStatCard;
