"use client";
import { IconArrowRight, IconTrendingUp } from "@tabler/icons-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const DashboardCard = () => {
  const router = useRouter();

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Comprehensive Report</CardDescription>
        <CardTitle className="flex flex-row gap-2 text-lg font-semibold tabular-nums @[250px]/card:text-3xl">
          Analytics <IconTrendingUp className="mt-2.5" size="22" />
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          <Button
            onClick={() => {
              router.push("/dashboard");
            }}
          >
            Complete Report <IconArrowRight />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DashboardCard;
