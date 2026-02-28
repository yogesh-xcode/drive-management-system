"use client";
import { Candidate } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function getInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getCandidateStatusClass(status: string) {
  const normalized = status.trim().toLowerCase();

  if (
    normalized.includes("offered") ||
    normalized.includes("selected") ||
    normalized.includes("hired") ||
    normalized.includes("joined")
  ) {
    return "status-completed";
  }

  if (
    normalized.includes("interview") ||
    normalized.includes("screen") ||
    normalized.includes("review") ||
    normalized.includes("shortlist")
  ) {
    return "status-ongoing";
  }

  if (
    normalized.includes("applied") ||
    normalized.includes("new") ||
    normalized.includes("pending")
  ) {
    return "status-scheduled";
  }

  return "status-unknown";
}

export const candidateColumns: ColumnDef<Candidate>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => {
      const fullName = String(row.getValue("fullName") ?? "");
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-[10px] font-medium">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <span>{fullName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "position",
    header: () => <div className="-ml-4.5">Position</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = String(row.getValue("status") ?? "");
      const colorClass = getCandidateStatusClass(status);

      return <span className={colorClass}>{status}</span>;
    },
  },
  {
    accessorKey: "appliedDate",
    header: "Applied Date",
    cell: ({ row }) => {
      const rawDate = row.getValue("appliedDate");
      if (typeof rawDate === "string" || typeof rawDate === "number") {
        return <div>{dayjs(rawDate).format("DD/MM/YYYY")}</div>;
      }
      return <div className="text-right text-muted">Invalid date</div>;
    },
  },
];
