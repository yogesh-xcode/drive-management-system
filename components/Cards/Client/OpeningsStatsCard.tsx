import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/types";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import dayjs from "dayjs";

function openingsForMonth(data: Client[], month: dayjs.Dayjs) {
  const monthKey = month.format("MM/YYYY");
  return data
    .filter((item) => dayjs(item.date).format("MM/YYYY") === monthKey)
    .reduce((sum, item) => sum + Number(item.opening || 0), 0);
}

export function OpeningsStatsCard({ data }: { data: Client[] }) {
  const thisMonth = openingsForMonth(data, dayjs());
  const lastMonth = openingsForMonth(data, dayjs().subtract(1, "month"));
  const totalOpenings = data.reduce((sum, item) => sum + Number(item.opening || 0), 0);
  const growth =
    lastMonth === 0 ? 0 : Number((((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1));
  const positive = growth >= 0;
  const TrendIcon = positive ? IconTrendingUp : IconTrendingDown;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Total Openings</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {totalOpenings}
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
          Month-over-month openings growth
        </span>
      </CardFooter>
    </Card>
  );
}
