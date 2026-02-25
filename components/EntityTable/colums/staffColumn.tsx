"use client";
import { Staff } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

export const staffColumns: ColumnDef<Staff>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
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
