"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Candidate, Client, Staff, Drive } from "@/types";
import { motion } from "framer-motion";

interface Props {
  staff: Staff[];
  clients: Client[];
  candidates: Candidate[];
  drives: Drive[];
}

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function buildChronoMonths(...groups: Record<string, number>[]) {
  return Array.from(new Set(groups.flatMap((g) => Object.keys(g))))
    .filter(Boolean)
    .sort();
}

function filterMonths(months: string[], monthsToShow: number) {
  return months.slice(-monthsToShow);
}

export default function CompanyOverviewAreaChart({
  staff,
  clients,
  candidates,
  drives,
}: Props) {
  const [range, setRange] = React.useState("6m");

  const resolveTokenColor = React.useCallback(
    (tokenName: string, fallback: string) => {
      if (typeof window === "undefined") return fallback;
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue(tokenName)
        .trim();
      if (!raw) return fallback;

      // Supports both component-style vars (`223 73% 46%`) and function-style vars (`oklch(...)`).
      if (
        raw.includes("(") ||
        raw.startsWith("#") ||
        raw.startsWith("rgb") ||
        raw.startsWith("hsl") ||
        raw.startsWith("oklch")
      ) {
        return raw;
      }

      return `hsl(${raw})`;
    },
    []
  );

  // 1. Staff joined per month
  const staffPerMonth: Record<string, number> = {};
  staff.forEach(({ joinedDate }) => {
    const key = getMonthKey(joinedDate?.toString?.() ?? "");
    if (!key) return;
    staffPerMonth[key] = (staffPerMonth[key] ?? 0) + 1;
  });

  // 2. Programs (clients) per month
  const programsPerMonth: Record<string, number> = {};
  clients.forEach(({ date }) => {
    const key = getMonthKey(date?.toString?.() ?? "");
    if (!key) return;
    programsPerMonth[key] = (programsPerMonth[key] ?? 0) + 1;
  });

  // 3. Candidate applies per month
  const appliesPerMonth: Record<string, number> = {};
  candidates.forEach(({ appliedDate }) => {
    const key = getMonthKey(appliedDate?.toString?.() ?? "");
    if (!key) return;
    appliesPerMonth[key] = (appliesPerMonth[key] ?? 0) + 1;
  });

  // 4. Drives per month (newly added)
  const drivesPerMonth: Record<string, number> = {};
  drives.forEach(({ date }) => {
    const key = getMonthKey(date?.toString?.() ?? "");
    if (!key) return;
    drivesPerMonth[key] = (drivesPerMonth[key] ?? 0) + 1;
  });

  // Build full month list across all datasets
  const months = buildChronoMonths(
    staffPerMonth,
    programsPerMonth,
    appliesPerMonth,
    drivesPerMonth
  );

  // Apply selected range filter
  const monthsToShow =
    range === "6m"
      ? 6
      : range === "3m"
      ? 3
      : range === "1m"
      ? 1
      : months.length;

  const filteredMonths = filterMonths(months, monthsToShow);

  // Final dataset for chart
  const chartData = filteredMonths.map((month) => ({
    month,
    staff: staffPerMonth[month] ?? 0,
    programs: programsPerMonth[month] ?? 0,
    candidates: appliesPerMonth[month] ?? 0,
    drives: drivesPerMonth[month] ?? 0, // ← added drives
  }));

  const monoColors = React.useMemo(
    () => ({
      staff: resolveTokenColor("--chart-1", "hsl(var(--chart-1))"),
      programs: resolveTokenColor("--chart-2", "hsl(var(--chart-2))"),
      candidates: resolveTokenColor("--chart-3", "hsl(var(--chart-3))"),
      drives: resolveTokenColor("--chart-4", "hsl(var(--chart-4))"),
      border: resolveTokenColor("--border", "hsl(var(--border))"),
      muted: resolveTokenColor(
        "--muted-foreground",
        "hsl(var(--muted-foreground))"
      ),
      card: resolveTokenColor("--card", "hsl(var(--card))"),
      cardForeground: resolveTokenColor(
        "--card-foreground",
        "hsl(var(--card-foreground))"
      ),
    }),
    [resolveTokenColor]
  );

  return (
    <Card className="mb-3 pt-0 bg-background shadow">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="font-mono text-base md:text-lg">
            Organization Overall Performance
          </CardTitle>
          <CardDescription className="font-mono text-xs text-muted-foreground">
            Staff Joined, New Programs, Candidate Applies & Drives per Month
          </CardDescription>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger
            className="w-[140px] rounded-lg ml-auto"
            aria-label="Select time window"
          >
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="6m" className="rounded-lg">
              Last 6 months
            </SelectItem>
            <SelectItem value="3m" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="1m" className="rounded-lg">
              Last month
            </SelectItem>
            <SelectItem value="all" className="rounded-lg">
              All Time
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pb-4 pt-5 sm:px-6 sm:pt-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <ResponsiveContainer width="100%" height={285}>
            <AreaChart
              data={chartData}
              margin={{ left: 10, right: 20, top: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillStaff" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={monoColors.staff}
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="95%"
                    stopColor={monoColors.staff}
                    stopOpacity={0.08}
                  />
                </linearGradient>
                <linearGradient id="fillPrograms" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={monoColors.programs}
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor={monoColors.programs}
                    stopOpacity={0.04}
                  />
                </linearGradient>
                <linearGradient id="fillCandidates" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={monoColors.candidates}
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor={monoColors.candidates}
                    stopOpacity={0.03}
                  />
                </linearGradient>
                <linearGradient id="fillDrives" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={monoColors.drives}
                    stopOpacity={0.65}
                  />
                  <stop
                    offset="95%"
                    stopColor={monoColors.drives}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="2 6"
                stroke={monoColors.border}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={7}
                fontSize={12}
                minTickGap={16}
                tick={{ fill: monoColors.muted }}
                className="font-mono text-xs"
                tickFormatter={(v) => {
                  const [y, m] = v.split("-");
                  return `${y.slice(2)}/${m}`;
                }}
              />
              <YAxis
                className="font-mono text-xs"
                fontSize={12}
                allowDecimals={false}
                tickMargin={4}
                tick={{ fill: monoColors.muted }}
              />
              <Tooltip
                contentStyle={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  borderRadius: 8,
                  border: `1px solid ${monoColors.border}`,
                  background: monoColors.card,
                  color: monoColors.cardForeground,
                }}
                cursor={{ stroke: monoColors.border, strokeDasharray: "3 4" }}
                labelFormatter={(label) => {
                  const [y, m] = label.split("-");
                  return `Month: ${y}/${m}`;
                }}
                formatter={(value, name) => [value, name]}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: monoColors.muted,
                }}
                iconType="rect"
                align="right"
                verticalAlign="top"
              />
              <Area
                dataKey="staff"
                name="Staff Joined"
                type="monotone"
                fill="url(#fillStaff)"
                stroke={monoColors.staff}
                strokeWidth={2}
                stackId="main"
                activeDot={{ r: 4 }}
              />
              <Area
                dataKey="programs"
                name="New Programs"
                type="monotone"
                fill="url(#fillPrograms)"
                stroke={monoColors.programs}
                strokeWidth={2}
                stackId="main"
                activeDot={{ r: 4 }}
              />
              <Area
                dataKey="candidates"
                name="Candidate Applies"
                type="monotone"
                fill="url(#fillCandidates)"
                stroke={monoColors.candidates}
                strokeWidth={2}
                stackId="main"
                activeDot={{ r: 4 }}
              />
              <Area
                dataKey="drives"
                name="Drives Conducted"
                type="monotone"
                fill="url(#fillDrives)"
                stroke={monoColors.drives}
                strokeWidth={2}
                stackId="main"
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
