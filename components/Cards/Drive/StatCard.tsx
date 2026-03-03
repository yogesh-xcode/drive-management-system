"use client";

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
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCalendarTime,
} from "@/lib/icons";
import { Drive } from "@/types";

type DriveStatsCardProps = {
  data: Drive[];
  type: "total" | "scheduled" | "ongoing" | "completed";
  description: string;
};

export function DriveStatsCard({
  data,
  type,
  description,
}: DriveStatsCardProps) {
  const now = dayjs();

  // Data buckets
  const scheduledDrives = data.filter((d) => d.status === "Scheduled");
  const ongoingDrives = data.filter((d) => d.status === "Ongoing");
  const completedDrives = data.filter((d) => d.status === "Completed");

  let title = description;
  let mainValue = 0;
  let badgeText = "";
  let badgeClass = "badge-neutral";
  let footerText = "";

  if (type === "total") {
    const total = data.length;
    const completed = completedDrives.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    title = "Total Drives";
    mainValue = total;
    badgeText = `${percentage}% Completed`;
    badgeClass = "badge-neutral";
    footerText = `${completed} completed • ${scheduledDrives.length} upcoming`;
  }

  if (type === "scheduled") {
    const nextDrive = scheduledDrives.length
      ? scheduledDrives.sort(
          (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
        )[0]
      : null;

    title = "Scheduled Drives";
    mainValue = scheduledDrives.length;
    badgeClass = "badge-warning";
    badgeText = nextDrive
      ? `Next: ${dayjs(nextDrive.date).format("DD MMM")}`
      : "No upcoming drives";
    footerText = nextDrive
      ? `Next drive in ${dayjs(nextDrive.date).diff(now, "day")} days`
      : "Plan more drives to fill the calendar";
  }

  if (type === "ongoing") {
    const todayOngoing = ongoingDrives.filter((d) =>
      dayjs(d.date).isSame(now, "day")
    ).length;

    title = "Ongoing Drives";
    mainValue = todayOngoing;
    badgeClass = todayOngoing > 0 ? "badge-info" : "badge-neutral";
    badgeText = todayOngoing > 0 ? "Live Now" : "No live drives";
    footerText = todayOngoing
      ? `Drives happening today: ${todayOngoing}`
      : "No drives happening today";
  }

  if (type === "completed") {
    const completed = completedDrives.length;
    const lastMonthCompleted = completedDrives.filter((d) =>
      dayjs(d.date).isSame(now.subtract(1, "month"), "month")
    ).length;

    const growth =
      lastMonthCompleted > 0
        ? Math.round(
            ((completed - lastMonthCompleted) / lastMonthCompleted) * 100
          )
        : 0;

    title = "Completed Drives";
    mainValue = completed;
    badgeClass = growth >= 0 ? "badge-success" : "badge-warning";
    badgeText = `${growth >= 0 ? "↑" : "↓"} ${Math.abs(growth)}% vs last month`;
    footerText = `${completed} drives completed so far`;
  }

  return (
    <Card className="@container/card ">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {mainValue}
        </CardTitle>
        <CardAction>
          <Badge variant="outline" className={`gap-1 ${badgeClass}`}>
            <IconCalendarTime className="w-4 h-4" />
            {badgeText}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">{footerText}</div>
      </CardFooter>
    </Card>
  );
}
