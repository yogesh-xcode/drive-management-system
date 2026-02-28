import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Candidate } from "@/types";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import dayjs from "dayjs";

function applicationsForMonth(data: Candidate[], month: dayjs.Dayjs) {
  const monthKey = month.format("MM/YYYY");
  return data.filter((item) => dayjs(item.appliedDate).format("MM/YYYY") === monthKey)
    .length;
}

export function ApplicationVelocityCard({ data }: { data: Candidate[] }) {
  const thisMonth = applicationsForMonth(data, dayjs());
  const lastMonth = applicationsForMonth(data, dayjs().subtract(1, "month"));
  const growth =
    lastMonth === 0 ? 0 : Number((((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1));
  const positive = growth >= 0;
  const TrendIcon = positive ? IconTrendingUp : IconTrendingDown;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>New Applications</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {thisMonth}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2">
        <Badge
          variant="outline"
          className={`flex gap-2 ${positive ? "badge-success" : "badge-warning"}`}
        >
          <TrendIcon className="size-4" />
          {growth >= 0 ? "+" : ""}
          {growth}%
        </Badge>
        <span className="text-muted-foreground ml-1 text-xs">
          Month-over-month application growth
        </span>
      </CardFooter>
    </Card>
  );
}
