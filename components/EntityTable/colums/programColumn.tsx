"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/types";
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

export const programColumns: ColumnDef<Client>[] = [
  {
    accessorKey: "programNo",
    header: "Program ID",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const rawDate = row.getValue("date");
      if (typeof rawDate === "string" || typeof rawDate === "number") {
        // Format as DD/MM/YYYY for all rows
        return <div>{dayjs(rawDate).format("DD/MM/YYYY")}</div>;
      }
      return <div className="text-right text-muted">Invalid date</div>;
    },
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => {
      const clientName = String(row.getValue("client") ?? "");
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-[10px] font-medium">
              {getInitials(clientName)}
            </AvatarFallback>
          </Avatar>
          <span>{clientName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "opening",
    header: "Opening",
  },
  {
    accessorKey: "contact",
    header: "Contact",
  },
];
