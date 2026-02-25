"use client";
import { Candidate } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

export const candidateColumns: ColumnDef<Candidate>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "status",
    header: "Status",
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
