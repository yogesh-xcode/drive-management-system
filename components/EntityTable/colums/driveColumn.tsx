"use client";
import { Drive } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

// ✅ Status color mapping
const statusColors: Record<string, string> = {
  Scheduled: "status-scheduled",
  Ongoing: "status-ongoing",
  Completed: "status-completed",
};

export const driveColumns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "title",
    header: "Drive Title",
  },
  {
    accessorKey: "location",
    header: () => "Location",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status") as string;
      const colorClass = statusColors[status] || "status-unknown";
      return <span className={colorClass}>{status}</span>;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }: any) => {
      const rawDate = row.getValue("date");
      if (typeof rawDate === "string" || typeof rawDate === "number") {
        return <div>{dayjs(rawDate).format("DD/MM/YYYY")}</div>;
      }
      return <div className="italic text-muted">Invalid date</div>;
    },
  },
] as ColumnDef<Drive>[];
