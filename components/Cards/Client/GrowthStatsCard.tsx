import React from "react";
import dayjs from "dayjs";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp, IconTrendingDown } from "@/lib/icons";

// dataType = your clientDataType
type GrowthStatsCardProps<T> = {
  data: T[];
  mode: "programs" | "clients";
  dateSelector: (item: T) => string | Date;
  uniqueField?: (item: T) => string; // For clients mode
  description: string;
  positiveLabel?: string;
  negativeLabel?: string;
  periodMonths?: number;
};

export function GrowthStatsCard<T>({
  data,
  mode,
  dateSelector,
  uniqueField,
  description,
  positiveLabel = "Growth this month",
  negativeLabel = "Down this month",
  periodMonths = 6,
}: GrowthStatsCardProps<T>) {
  const now = dayjs();
  const periodAgo = now.subtract(periodMonths, "month");
  const monthKey = (date: string | Date) => dayjs(date).format("MM/YYYY");
  const thisMonthKey = now.format("MM/YYYY");
  const lastMonthKey = now.subtract(1, "month").format("MM/YYYY");

  // Last 6 months data (for growth)
  const recentData = data.filter((item) =>
    dayjs(dateSelector(item)).isAfter(periodAgo)
  );

  // Total section
  let total: number;
  if (mode === "clients" && uniqueField) {
    total = new Set(data.map(uniqueField)).size; // all-time unique clients
  } else {
    total = data.length; // all-time programs count
  }

  // Growth section (last 6 months only)
  let thisMonthCount: number = 0;
  let lastMonthCount: number = 0;
  if (mode === "clients" && uniqueField) {
    thisMonthCount = new Set(
      recentData
        .filter((item) => monthKey(dateSelector(item)) === thisMonthKey)
        .map(uniqueField)
    ).size;
    lastMonthCount = new Set(
      recentData
        .filter((item) => monthKey(dateSelector(item)) === lastMonthKey)
        .map(uniqueField)
    ).size;
  } else {
    thisMonthCount = recentData.filter(
      (item) => monthKey(dateSelector(item)) === thisMonthKey
    ).length;
    lastMonthCount = recentData.filter(
      (item) => monthKey(dateSelector(item)) === lastMonthKey
    ).length;
  }

  const growth =
    lastMonthCount !== 0
      ? Number(
          (((thisMonthCount - lastMonthCount) / lastMonthCount) * 100).toFixed(
            1
          )
        )
      : 0;
  const positive = growth >= 0;
  const TrendIcon = positive ? IconTrendingUp : IconTrendingDown;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {total}
        </CardTitle>
        <CardAction>
          <Badge
            variant="outline"
            className={positive ? "badge-success" : "badge-danger"}
          >
            <TrendIcon />
            {growth >= 0 ? "+" : ""}
            {growth}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {positive ? positiveLabel : negativeLabel}
          <TrendIcon className="size-4" />
        </div>
        <div className="text-muted-foreground">
          Growth based on last {periodMonths} months
        </div>
      </CardFooter>
    </Card>
  );
}
