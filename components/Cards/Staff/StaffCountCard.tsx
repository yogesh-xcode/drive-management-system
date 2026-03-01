import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Staff } from "@/types";
import { IconTrendingDown, IconTrendingUp } from "@/lib/icons";
import dayjs from "dayjs";

function countByMonth(data: Staff[], month: dayjs.Dayjs) {
  const monthKey = month.format("MM/YYYY");
  return data.filter((item) => dayjs(item.joinedDate).format("MM/YYYY") === monthKey)
    .length;
}

export default function StaffCountCard({ data }: { data: Staff[] }) {
  const now = dayjs();
  const thisMonth = countByMonth(data, now);
  const lastMonth = countByMonth(data, now.subtract(1, "month"));
  const growth =
    lastMonth === 0 ? 0 : Number((((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1));
  const positive = growth >= 0;
  const TrendIcon = positive ? IconTrendingUp : IconTrendingDown;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Total Staff</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {data.length}
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
          Month-over-month joiner growth
        </span>
      </CardFooter>
    </Card>
  );
}
