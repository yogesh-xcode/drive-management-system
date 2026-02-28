"use client";
import { Staff } from "@/types";
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

export const staffColumns: ColumnDef<Staff>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = String(row.getValue("name") ?? "");
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-[10px] font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "joinedDate",
    header: "Joined Date",
    cell: ({ row }) => {
      const rawDate = row.getValue("joinedDate");
      if (typeof rawDate === "string" || typeof rawDate === "number") {
        return <div>{dayjs(rawDate).format("DD/MM/YYYY")}</div>;
      }
      return <div className="text-right text-muted">Invalid date</div>;
    },
  },
];
