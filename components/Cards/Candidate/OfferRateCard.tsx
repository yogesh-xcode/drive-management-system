import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp, IconTrendingDown } from "@/lib/icons";
import React from "react";

export interface Candidate {
  id: number;
  fullName: string;
  position: string;
  status: string;
  appliedDate: string | Date;
}

function getOfferRate(candidates: Candidate[]): number {
  const total = candidates.length;
  const offered = candidates.filter((c) => c.status === "Offered").length;
  return total === 0 ? 0 : Number(((offered / total) * 100).toFixed(1));
}

export function OfferRateCard({ data }: { data: Candidate[] }) {
  const rate = getOfferRate(data);
  const positive = rate >= 20; // Example threshold
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Offer Rate</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {rate}%
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2">
        <Badge
          variant="outline"
          className={`flex gap-2 ${positive ? "badge-success" : "badge-warning"}`}
        >
          {positive ? "Healthy offer ratio" : "Low offer ratio"}

          {positive ? (
            <IconTrendingUp className="size-4" />
          ) : (
            <IconTrendingDown className="size-4" />
          )}
        </Badge>
        <span className="text-muted-foreground ml-1 text-xs">
          % of all candidates received an offer
        </span>
      </CardFooter>
    </Card>
  );
}
